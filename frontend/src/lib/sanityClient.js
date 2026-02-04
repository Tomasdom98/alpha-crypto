import { createClient } from '@sanity/client';

const projectId = '15c5x8s5';
const dataset = 'production';
const apiVersion = '2024-01-01';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Use CDN for faster response
});

// Fetch all articles
export async function fetchArticles(category = null) {
  let query = '*[_type == "article"] | order(publishedAt desc)';
  
  if (category && category !== 'all') {
    query = `*[_type == "article" && category == "${category}"] | order(publishedAt desc)`;
  }
  
  query += ` {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    content,
    category,
    premium,
    publishedAt
  }`;
  
  return await sanityClient.fetch(query);
}

// Fetch single article by slug
export async function fetchArticleBySlug(slug) {
  const query = `*[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    content,
    category,
    premium,
    publishedAt
  }`;
  
  return await sanityClient.fetch(query, { slug });
}

// Fetch all airdrops
export async function fetchAirdrops(status = null, difficulty = null) {
  let filters = [];
  
  if (status && status !== 'all') {
    filters.push(`status == "${status}"`);
  }
  
  if (difficulty && difficulty !== 'all') {
    filters.push(`difficulty == "${difficulty}"`);
  }
  
  const filterString = filters.length > 0 ? ` && ${filters.join(' && ')}` : '';
  
  const query = `*[_type == "airdrop"${filterString}] | order(deadline asc) {
    _id,
    projectName,
    description,
    steps,
    deadline,
    estimatedReward,
    difficulty,
    status,
    link,
    premium
  }`;
  
  return await sanityClient.fetch(query);
}

// Fetch single airdrop by ID
export async function fetchAirdropById(id) {
  const query = `*[_type == "airdrop" && _id == $id][0] {
    _id,
    projectName,
    description,
    steps,
    deadline,
    estimatedReward,
    difficulty,
    status,
    link,
    premium
  }`;
  
  return await sanityClient.fetch(query, { id });
}