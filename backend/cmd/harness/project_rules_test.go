package main

import (
	"context"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestProjectRulesIncludeCommonAndLocalContents(t *testing.T) {
	root := harnessRootFixture(t)
	text, err := readProjectRules(root)
	if err != nil || !strings.Contains(text, "regra comum do monorepo") || !strings.Contains(text, "backend/docs/rules.md") {
		t.Fatalf("contexto incompleto: %v %s", err, text)
	}
}

func TestProjectRulesRejectMissingOrEmptyDocument(t *testing.T) {
	for _, empty := range []bool{false, true} {
		root := harnessRootFixture(t)
		path := filepath.Join(root, "docs", "rules.md")
		if empty {
			if err := os.WriteFile(path, []byte(" \n"), 0600); err != nil {
				t.Fatal(err)
			}
		} else if err := os.Remove(path); err != nil {
			t.Fatal(err)
		}
		if _, err := readProjectRules(root); err == nil {
			t.Fatal("contexto incompleto foi aceito")
		}
	}
}

func TestPipelineRejectsMissingRulesBeforeStartingAgent(t *testing.T) {
	root := harnessRootFixture(t)
	if err := os.Remove(filepath.Join(root, "docs", "rules.md")); err != nil {
		t.Fatal(err)
	}
	git := mainGitState()
	run := func(ctx context.Context, cwd, name string, args []string, input string, out io.Writer) error {
		if handled, err := git.handle(t, name, args, out); handled {
			return err
		}
		t.Fatal("o harness iniciou um agente com regras incompletas")
		return nil
	}
	err := pipeline(context.Background(), root, t.TempDir(), "fake-codex", "task", 1, run)
	if err == nil || !strings.Contains(err.Error(), "regra obrigatoria") {
		t.Fatalf("falha não identificada: %v", err)
	}
}

func TestReviewerReceivesRulesChangedAfterImplementation(t *testing.T) {
	root := harnessRootFixture(t)
	git := mainGitState()
	agents := 0
	run := func(ctx context.Context, cwd, name string, args []string, input string, out io.Writer) error {
		if handled, err := git.handle(t, name, args, out); handled {
			return err
		}
		if name != "fake-codex" {
			return nil
		}
		agents++
		var output string
		for index, arg := range args {
			if arg == "--output-last-message" {
				output = args[index+1]
			}
		}
		if agents == 1 {
			if err := os.WriteFile(filepath.Join(root, "docs", "rules.md"), []byte("regra atualizada durante a implementacao"), 0600); err != nil {
				t.Fatal(err)
			}
		} else if !strings.Contains(input, "regra atualizada durante a implementacao") {
			t.Fatal("o revisor recebeu regras antigas")
		}
		return writeJSON(output, verdict{"complete", "checked"})
	}
	if err := pipeline(context.Background(), root, t.TempDir(), "fake-codex", "task", 1, run); err != nil {
		t.Fatal(err)
	}
	if agents != 2 {
		t.Fatalf("agentes simulados: %d", agents)
	}
}
