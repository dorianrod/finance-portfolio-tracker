"""Executable dependency rules for the pipeline's layered architecture."""

import ast
from pathlib import Path

SOURCE_ROOT = Path(__file__).parents[2] / "src"
ALLOWED_DEPENDENCIES = {
    "domain": {"domain"},
    "ports": {"domain", "ports"},
    "application": {"domain", "ports", "application"},
}


def _src_imports(path: Path) -> set[str]:
    tree = ast.parse(path.read_text(), filename=str(path))
    imports: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and node.module:
            if node.module.startswith("src."):
                imports.add(node.module)
        elif isinstance(node, ast.Import):
            imports.update(
                alias.name
                for alias in node.names
                if alias.name.startswith("src.")
            )
    return imports


def test_inner_layers_do_not_depend_on_outer_layers():
    violations: list[str] = []

    for layer, allowed in ALLOWED_DEPENDENCIES.items():
        for path in sorted((SOURCE_ROOT / layer).rglob("*.py")):
            for module in sorted(_src_imports(path)):
                imported_layer = module.split(".", 2)[1]
                if imported_layer not in allowed:
                    violations.append(
                        f"{path.relative_to(SOURCE_ROOT)} imports {module}"
                    )

    assert violations == [], "Layer boundary violations:\n" + "\n".join(
        violations
    )
