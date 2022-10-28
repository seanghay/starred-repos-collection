import path from 'node:path'
import fs from 'node:fs/promises'
import 'dotenv/config';
import { Octokit } from 'octokit';

await fs.mkdir('data', { recursive: true })

const auth = process.env.GH_TOKEN;
const username = process.env.GH_LOGIN;

const octokit = new Octokit({ auth });

const iterator = octokit.paginate.iterator(octokit.rest.activity.listReposStarredByUser, {
  username,
  per_page: 100
})

for await (const response of iterator) {
  for (const repo of response.data) {
    if (!repo) continue;
    const [owner, name] = repo.full_name.split('/');
    const dir = path.join('data', owner);
    const filepath = path.join(dir, `${name}.json`)
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(repo, null, 2), 'utf-8')
    console.log(`write to ${filepath}`);
  }
}
