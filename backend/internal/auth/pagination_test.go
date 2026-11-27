package auth

import (
	"Sobra_Ai_Back-end/internal/database"
	"database/sql"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestGetUsersRejectsInvalidPaginationBeforeQuery(t *testing.T) {
	gin.SetMode(gin.TestMode)
	recorder := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(recorder)
	context.Request = httptest.NewRequest(http.MethodGet, "/api/auth/users?limit=101", nil)

	getUsers(context)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", recorder.Code)
	}
}

func TestParseUserFilters(t *testing.T) {
	filters, err := parseUserFilters(url.Values{
		"search": {" Maria "},
		"role":   {" ADMIN "},
		"status": {" active "},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if filters.Search != "Maria" || filters.Role != "admin" {
		t.Fatalf("unexpected filters: %+v", filters)
	}
	if !filters.StatusEnabled || filters.Blocked {
		t.Fatalf("expected active status filter, got %+v", filters)
	}
}

func TestParseUserFiltersAcceptsPremiumRole(t *testing.T) {
	filters, err := parseUserFilters(url.Values{"role": {"premium"}})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if filters.Role != "premium" {
		t.Fatalf("expected premium role filter, got %q", filters.Role)
	}
}

func TestGetUsersRejectsInvalidFiltersBeforeQuery(t *testing.T) {
	tests := []string{
		"/api/auth/users?role=manager",
		"/api/auth/users?status=pending",
		"/api/admin/users?sort=last_active",
	}

	for _, target := range tests {
		t.Run(target, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			context, _ := gin.CreateTestContext(recorder)
			context.Request = httptest.NewRequest(http.MethodGet, target, nil)

			getUsers(context)

			if recorder.Code != http.StatusBadRequest {
				t.Fatalf("expected 400, got %d", recorder.Code)
			}
		})
	}
}

func TestParseUserSort(t *testing.T) {
	tests := map[string]string{
		"":                 "",
		"last_active_desc": "last_active_at DESC NULLS LAST",
		"last_active_asc":  "last_active_at ASC NULLS LAST",
		"blocked_at_desc":  "access_blocked_at DESC NULLS LAST",
	}
	for input, want := range tests {
		got, err := parseUserSort(url.Values{"sort": {input}})
		if err != nil || got != want {
			t.Errorf("parseUserSort(%q) = %q, %v; want %q", input, got, err, want)
		}
	}
}

func TestGetUsersSortsFilteredResultsBeforePagination(t *testing.T) {
	db, err := gorm.Open(postgres.New(postgres.Config{Conn: &sql.DB{}}), &gorm.Config{
		DisableAutomaticPing: true,
		DryRun:               true,
	})
	if err != nil {
		t.Fatal(err)
	}
	var queries []string
	if err := db.Callback().Query().After("gorm:query").Register("test:capture_sql", func(tx *gorm.DB) {
		queries = append(queries, tx.Statement.SQL.String())
	}); err != nil {
		t.Fatal(err)
	}
	previousDB := database.DB
	database.DB = db
	t.Cleanup(func() { database.DB = previousDB })

	recorder := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(recorder)
	context.Request = httptest.NewRequest(http.MethodGet, "/api/admin/users?role=premium&page=2&limit=5&sort=last_active_desc", nil)
	getUsers(context)

	if recorder.Code != http.StatusOK || len(queries) != 2 {
		t.Fatalf("status = %d, queries = %v", recorder.Code, queries)
	}
	if strings.Contains(queries[0], "ORDER BY") ||
		!strings.Contains(queries[1], "WHERE LOWER(role) = $1 ORDER BY last_active_at DESC NULLS LAST,id asc LIMIT $2 OFFSET $3") {
		t.Fatalf("unexpected count or listing query: %v", queries)
	}
}
