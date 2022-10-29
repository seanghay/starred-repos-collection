import slugify from 'slugify'
import { millify } from 'millify'
import fs from 'node:fs/promises'
import _ from 'lodash'
import fg from 'fast-glob';

const stream = fg.stream('./data/**/*.json');

const topicsCollection = new Map();
const languagesCollections = new Map();

for await (const file of stream) {

  /**
   * gettin' types ;)
   * @type {Awaited<ReturnType<import('octokit').Octokit['rest']['activity']['listReposStarredByUser']>>['data'][number]}
   */
  const repo = JSON.parse(await fs.readFile(file, 'utf-8'));
  const topics = repo.topics && repo.topics.length > 0 ? repo.topics : ["Uncategorized"];

  for (const topic of topics) {
    const items = topicsCollection.get(topic) || [];
    items.push(repo);
    topicsCollection.set(topic, items);
  }

  if (repo.language) {
    const items = languagesCollections.get(repo.language) || [];
    items.push(repo);
    languagesCollections.set(repo.language, items)
  }

}

const languages = Object.fromEntries([...languagesCollections.entries()].sort());

// generate language page
let markdown = "# Languages\n\n"

for (const language in languages) {
  const slug = slugify(language.toLowerCase())
  markdown += `[\`${language}\`](#${slug}) `;
}

markdown += `\n\n --- \n\n`;

for (const language in languages) {
  markdown += `## ${language}\n\n`;

  const repos = languages[language];
  for (const repo of repos) {
    markdown += `#### [${repo.full_name}](${repo.html_url}) \n\n`;
    markdown += `⭐️ ${millify(repo.stargazers_count)} \n\n`;

    if (repo.description) {
      markdown += `${repo.description} \n\n`;
    }

    if (repo.homepage) {
      markdown += `[${repo.homepage}](${repo.homepage})\n\n`
    }

    markdown += `--- \n\n`;
  }
}

await fs.writeFile('./docs/languages.md', markdown, 'utf-8');