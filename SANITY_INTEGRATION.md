# Sanity CMS Integration Guide for Alpha Crypto

## Overview
Alpha Crypto is now integrated with Sanity CMS for content management of articles and airdrops. The system automatically falls back to mock data if Sanity content is not available.

## Sanity Project Details
- **Project ID**: 15c5x8s5
- **Dataset**: production
- **API Version**: 2024-01-01

## Content Schemas

### Articles Schema
Create articles in Sanity Studio with these fields:

```javascript
{
  title: string (required),
  slug: {
    current: string (required, auto-generated from title)
  },
  excerpt: string (required, max 200 chars),
  content: array of blocks (rich text),
  category: string (required, options: stablecoins | defi | ai | analysis | news),
  premium: boolean (default: false),
  publishedAt: datetime (required)
}
```

### Airdrops Schema
Create airdrops in Sanity Studio with these fields:

```javascript
{
  projectName: string (required),
  description: string (required),
  steps: array of objects [{
    id: string,
    description: string,
    completed: boolean
  }],
  deadline: date (required),
  estimatedReward: string (required),
  difficulty: string (required, options: Easy | Medium | Hard),
  status: string (required, options: active | expired),
  link: url (required),
  premium: boolean (default: false)
}
```

## Setting Up Sanity Studio

### 1. Install Sanity CLI
```bash
npm install -g @sanity/cli
```

### 2. Initialize Sanity Studio
```bash
# Create a new directory for Sanity Studio
mkdir sanity-studio
cd sanity-studio

# Initialize with existing project
npm create sanity@latest -- --project 15c5x8s5 --dataset production
```

### 3. Configure Schemas
Create schema files in `sanity-studio/schemaTypes/`:

**articleType.js:**
```javascript
import {defineField, defineType} from 'sanity'

export const articleType = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'string',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Stablecoins', value: 'stablecoins'},
          {title: 'DeFi', value: 'defi'},
          {title: 'AI', value: 'ai'},
          {title: 'Analysis', value: 'analysis'},
          {title: 'News', value: 'news'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'premium',
      title: 'Premium Content',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
})
```

**airdropType.js:**
```javascript
import {defineField, defineType} from 'sanity'

export const airdropType = defineType({
  name: 'airdrop',
  title: 'Airdrop',
  type: 'document',
  fields: [
    defineField({
      name: 'projectName',
      title: 'Project Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'steps',
      title: 'Steps to Complete',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'id', type: 'string', title: 'ID'},
            {name: 'description', type: 'string', title: 'Description'},
            {name: 'completed', type: 'boolean', title: 'Completed', initialValue: false},
          ],
        },
      ],
    }),
    defineField({
      name: 'deadline',
      title: 'Deadline',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'estimatedReward',
      title: 'Estimated Reward',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          {title: 'Easy', value: 'Easy'},
          {title: 'Medium', value: 'Medium'},
          {title: 'Hard', value: 'Hard'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Expired', value: 'expired'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Project Link',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'premium',
      title: 'Premium Content',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
```

**index.js:**
```javascript
import {articleType} from './articleType'
import {airdropType} from './airdropType'

export const schemaTypes = [articleType, airdropType]
```

### 4. Run Sanity Studio
```bash
cd sanity-studio
npm run dev
```

Access Sanity Studio at: http://localhost:3333

## How It Works

### Backend (FastAPI)
- **Location**: `/app/backend/sanity_client.py`
- Fetches content from Sanity using GROQ queries via HTTP API
- Falls back to mock data if Sanity returns empty results or errors
- Endpoints:
  - `GET /api/articles?category={category}`
  - `GET /api/articles/{slug}`
  - `GET /api/airdrops?status={status}&difficulty={difficulty}`
  - `GET /api/airdrops/{id}`

### Frontend (React)
- **Location**: `/app/frontend/src/lib/sanityClient.js`
- Uses `@sanity/client` npm package
- Configured to use CDN for faster response
- Same GROQ queries as backend for consistency

## Creating Content in Sanity

### 1. Login to Sanity Studio
```bash
cd sanity-studio
npm run dev
# Open http://localhost:3333
```

### 2. Create an Article
1. Click "Article" in the sidebar
2. Click "Create new document"
3. Fill in all required fields:
   - Title: "Your Article Title"
   - Click "Generate" next to Slug field
   - Excerpt: Brief description (max 200 chars)
   - Content: Write your article content
   - Category: Select from dropdown
   - Premium: Toggle if premium content
   - Published At: Select date/time
4. Click "Publish"

### 3. Create an Airdrop
1. Click "Airdrop" in the sidebar
2. Click "Create new document"
3. Fill in all required fields:
   - Project Name: e.g., "LayerZero"
   - Description: Brief description
   - Steps: Click "Add item" for each step
   - Deadline: Select future date
   - Estimated Reward: e.g., "$500-2000"
   - Difficulty: Select Easy/Medium/Hard
   - Status: Select active/expired
   - Link: Project URL
   - Premium: Toggle if exclusive
4. Click "Publish"

## Testing the Integration

### Test Backend API
```bash
# Test articles endpoint
curl http://localhost:8001/api/articles

# Test specific article by slug
curl http://localhost:8001/api/articles/your-article-slug

# Test airdrops endpoint
curl http://localhost:8001/api/airdrops?status=active

# Test with category filter
curl http://localhost:8001/api/articles?category=defi
```

### Test Frontend
1. Open http://localhost:3000
2. Check if articles and airdrops are displayed
3. If Sanity has no content, you'll see mock data
4. Once you create content in Sanity, refresh to see real data

## Deploying to Production

### Environment Variables
No additional environment variables needed! The integration uses:
- Project ID: bj6asnq3 (hardcoded, safe for public read-only access)
- Dataset: production
- CDN enabled for performance

### Deployment Steps
1. Deploy your Sanity Studio to sanity.io:
   ```bash
   cd sanity-studio
   npm run build
   npm run deploy
   ```
2. Access your production Studio at: https://your-project.sanity.studio
3. Deploy your Next.js app (we'll restructure for Next.js next)

## Fallback Behavior
The system is designed to be resilient:
- If Sanity API is unavailable → Falls back to mock data
- If query returns no results → Returns empty array
- If specific item not found → Returns 404 with error message

This ensures your site stays functional even during Sanity maintenance or setup.

## Next Steps
1. Create sample content in Sanity Studio
2. Test the integration locally
3. Export project to GitHub
4. Restructure for Next.js (combined frontend + backend)
5. Deploy to Vercel
