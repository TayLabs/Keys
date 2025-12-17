import { load } from 'js-yaml';

export interface RepoConfig {
	repo: string;
	config: Config;
}

type Config = {
	service: string;
	permissions: {
		key: string;
		description: string;
		allowKey: boolean; // Notes whether an api key can be set to access this permission
	};
};

interface GitHubRepo {
	name: string;
	archived: boolean;
}

async function listOrgRepos(org: string): Promise<GitHubRepo[]> {
	const baseUrl = `https://api.github.com/orgs/${org}/repos`;
	const headers: Record<string, string> = {
		'User-Agent': 'service-suite-config-scanner',
		Accept: 'application/vnd.github+json',
	};

	const perPage = 100;
	let page = 1;
	const repos: GitHubRepo[] = [];

	// Basic pagination loop
	while (true) {
		const url = `${baseUrl}?per_page=${perPage}&page=${page}`;
		const res = await fetch(url, { headers });

		if (!res.ok) {
			throw new Error(`Failed to list repos: ${res.status} ${res.statusText}`);
		}

		const chunk = (await res.json()) as any[];
		if (chunk.length === 0) break;

		for (const r of chunk) {
			repos.push({
				name: r.name,
				archived: !!r.archived,
			});
		}

		if (chunk.length < perPage) break;
		page++;
	}

	return repos;
}

async function fetchConfigRaw(
	org: string,
	repo: string,
	path: string
): Promise<string | null> {
	const url = `https://raw.githubusercontent.com/${org}/${repo}/main/${path}`;

	const headers: Record<string, string> = {
		'User-Agent': 'service-suite-config-scanner',
	};

	const res = await fetch(url, { headers });

	if (res.status === 404) {
		// No config file for this repo
		return null;
	}

	if (!res.ok) {
		throw new Error(
			`Failed to fetch config for ${org}/${repo}: ${res.status} ${res.statusText}`
		);
	}

	return await res.text();
}

export default async function fetchPermissions(): Promise<RepoConfig[]> {
	const repos = await listOrgRepos('TayLabs');

	const results: RepoConfig[] = [];

	for (const repo of repos) {
		if (repo.archived) continue;

		const configText = await fetchConfigRaw(
			'TayLabs',
			repo.name,
			'taylab.config.yml'
		);
		if (!configText) continue;

		const config = load(configText) as Config;

		results.push({
			repo: repo.name,
			config,
		});
	}

	return results;
}
