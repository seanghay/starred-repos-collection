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

const sortedEntries = [...topicsCollection.entries()].sort();
const languages = Object.fromEntries([...languagesCollections.entries()].sort());

let markdown = '# Starred Repos Collection\n\n';
markdown += "Organize your starred repos on GitHub into searchable topics.\n\n";
markdown += "\n"

markdown += `## Languages \n\n`;

for (const language in languages) {
  markdown += `\`${language}\` `;
}

markdown += `\n\n--- \n\n`;

for (const [topic, repos] of sortedEntries) {

  markdown += `## ${topic} \n\n`;

  for (const repo of repos) {
    markdown += `#### [${repo.full_name}](${repo.html_url}) \n\n`;
    
    if (repo.description) {
      markdown += `${repo.description} \n\n`;
    }
    
    markdown += `⭐️ ${millify(repo.stargazers_count)} \n\n`;
    markdown += `\`${repo.language}\` \n\n`;
    markdown += `--- \n\n`;
  }

}

await fs.writeFile('readme.md', markdown, 'utf-8');
await fs.mkdir('docs', { recursive: true });

// generate language page
markdown = "# Languages\n\n"

for (const language in languages) {
  const slug = slugify(language)
  markdown += `[\`${language}\`](#${slug}) `;
}

markdown += `\n\n --- \n\n`;

for (const language in languages) {
  const slug = slugify(language)
  markdown += `## [${language}][${slug}]\n\n`;
  const repos = languages[language];
  for (const repo of repos) {
    markdown += `#### [${repo.full_name}](${repo.html_url}) \n\n`;
    
    if (repo.description) {
      markdown += `${repo.description} \n\n`;
    }
    
    markdown += `⭐️ ${millify(repo.stargazers_count)} \n\n`;
    markdown += `--- \n\n`;
  }
}

await fs.writeFile('./docs/languages.md', markdown, 'utf-8');