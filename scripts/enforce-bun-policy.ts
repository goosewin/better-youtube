const required = "1.3.14";

function compareVersions(a: string, b: string) {
  const left = a.split(".").map((part) => Number.parseInt(part, 10));
  const right = b.split(".").map((part) => Number.parseInt(part, 10));
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const l = left[index] ?? 0;
    const r = right[index] ?? 0;
    if (l !== r) return l - r;
  }
  return 0;
}

const failures: string[] = [];
if (compareVersions(Bun.version, required) < 0) {
  failures.push(`Bun ${required}+ is required; found ${Bun.version}.`);
}

const userAgent = Bun.env.npm_config_user_agent ?? "";
if (userAgent && !userAgent.startsWith("bun/")) {
  failures.push(`Use Bun, not ${userAgent}.`);
}

const packageJson = await Bun.file("package.json").json();
if (packageJson.packageManager !== "bun@1.3.14") {
  failures.push('package.json must declare "packageManager": "bun@1.3.14".');
}

for (const disallowed of ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"]) {
  if (await Bun.file(disallowed).exists()) {
    failures.push(`Remove ${disallowed}; bun.lock is the only allowed lockfile.`);
  }
}

const bunfig = await Bun.file("bunfig.toml").text().catch(() => "");
if (!/minimumReleaseAge\s*=\s*1209600/.test(bunfig)) {
  failures.push("bunfig.toml must enforce minimumReleaseAge = 1209600.");
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
