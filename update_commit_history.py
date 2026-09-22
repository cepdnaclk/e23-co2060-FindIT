#!/usr/bin/env python3
import subprocess
from pathlib import Path


def main() -> None:
    repo_dir = Path(__file__).resolve().parent
    history_path = repo_dir / "commit_history.txt"

    log_output = subprocess.check_output(
        ["git", "log", "--pretty=format:%h - %an, %ar : %s"],
        cwd=repo_dir,
        text=True,
    )

    lines = [line.rstrip("\n") for line in log_output.splitlines() if line.strip()]
    content = "\r\n".join(lines) + "\r\n"
    history_path.write_text(content, encoding="utf-16")

    print(f"Updated {history_path} with {len(lines)} commits")


if __name__ == "__main__":
    main()
