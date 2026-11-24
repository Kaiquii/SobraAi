package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func readProjectRules(root string) (string, error) {
	monorepo := filepath.Dir(root)
	data, err := os.ReadFile(filepath.Join(monorepo, "project-rules.json"))
	if err != nil {
		return "", fmt.Errorf("mapa de regras obrigatorio: %w", err)
	}
	var manifest struct {
		SchemaVersion int                 `json:"schemaVersion"`
		Common        []string            `json:"common"`
		Projects      map[string][]string `json:"projects"`
	}
	if err = json.Unmarshal(data, &manifest); err != nil {
		return "", fmt.Errorf("mapa de regras invalido: %w", err)
	}
	hasRootRules := false
	for _, file := range manifest.Common {
		hasRootRules = hasRootRules || file == "AGENTS.md"
	}
	if manifest.SchemaVersion != 1 || !hasRootRules || len(manifest.Projects["backend"]) == 0 {
		return "", fmt.Errorf("mapa de regras incompleto para o backend")
	}
	var context strings.Builder
	seen := make(map[string]bool)
	for _, file := range append(manifest.Common, manifest.Projects["backend"]...) {
		if seen[file] {
			continue
		}
		seen[file] = true
		path := filepath.Join(monorepo, filepath.FromSlash(file))
		relative, relErr := filepath.Rel(monorepo, path)
		if relErr != nil || filepath.IsAbs(file) || !strings.HasSuffix(file, ".md") ||
			relative == ".." || strings.HasPrefix(relative, ".."+string(filepath.Separator)) {
			return "", fmt.Errorf("caminho de regra invalido: %s", file)
		}
		contents, readErr := os.ReadFile(path)
		if readErr != nil {
			return "", fmt.Errorf("regra obrigatoria ausente ou ilegivel %s: %w", file, readErr)
		}
		if strings.TrimSpace(string(contents)) == "" {
			return "", fmt.Errorf("regra obrigatoria vazia: %s", file)
		}
		fmt.Fprintf(&context, "\n--- REGRA: %s ---\n%s\n", file, contents)
	}
	return context.String(), nil
}
