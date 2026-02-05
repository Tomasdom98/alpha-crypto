# Sanity CMS Schemas for Alpha Crypto
# Project ID: 15c5x8s5

These schema definitions should be added to your Sanity Studio project.
Copy these to your Sanity project's `schemas/` folder.

## 1. Article Schema (schemas/article.js)

```javascript
export default {
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short description for article cards'
    },
    {
      name: 'content',
      title: 'Content',
      type: 'text',
      description: 'Full article content (supports markdown)'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Market Analysis', value: 'Market'},
          {title: 'Technology', value: 'Technology'},
          {title: 'DeFi', value: 'DeFi'},
          {title: 'Stablecoins', value: 'Stablecoins'},
          {title: 'AI', value: 'AI'},
          {title: 'Prediction', value: 'Prediction'},
          {title: 'News', value: 'News'}
        ]
      }
    },
    {
      name: 'premium',
      title: 'Premium Content',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    },
    {
      name: 'imageUrl',
      title: 'Image URL',
      type: 'url',
      description: 'URL of the article cover image'
    }
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      premium: 'premium'
    },
    prepare({title, category, premium}) {
      return {
        title: title,
        subtitle: `${category || 'No category'} ${premium ? '⭐ Premium' : ''}`
      }
    }
  }
}
```

## 2. Airdrop Schema (schemas/airdrop.js)

```javascript
export default {
  name: 'airdrop',
  title: 'Airdrop',
  type: 'document',
  fields: [
    {
      name: 'projectName',
      title: 'Project Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'logoUrl',
      title: 'Logo URL',
      type: 'url',
      description: 'URL of the project logo (CoinGecko or official)'
    },
    {
      name: 'chain',
      title: 'Chain/Network',
      type: 'string',
      options: {
        list: [
          {title: 'Ethereum', value: 'Ethereum'},
          {title: 'Solana', value: 'Solana'},
          {title: 'Arbitrum', value: 'Arbitrum'},
          {title: 'Optimism', value: 'Optimism'},
          {title: 'Base', value: 'Base'},
          {title: 'Starknet', value: 'Starknet'},
          {title: 'zkSync', value: 'zkSync'},
          {title: 'Polygon', value: 'Polygon'},
          {title: 'Multi-chain', value: 'Multi-chain'},
          {title: 'Custom L1', value: 'Custom L1'}
        ]
      }
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 2
    },
    {
      name: 'fullDescription',
      title: 'Full Description',
      type: 'text',
      rows: 5
    },
    {
      name: 'backing',
      title: 'Backing/Investors',
      type: 'string',
      description: 'e.g., "Backed by Paradigm, a]crypto - $20M raised"'
    },
    {
      name: 'timeline',
      title: 'Timeline',
      type: 'string',
      description: 'e.g., "Token expected Q4 2024"'
    },
    {
      name: 'rewardNote',
      title: 'Reward Note',
      type: 'string',
      initialValue: 'Reward varies based on trading volume, points earned, and participation level'
    },
    {
      name: 'steps',
      title: 'Steps/Tasks',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'id', title: 'Task ID', type: 'string'},
            {name: 'description', title: 'Description', type: 'string'},
            {name: 'completed', title: 'Completed', type: 'boolean', initialValue: false}
          ]
        }
      ]
    },
    {
      name: 'estimatedReward',
      title: 'Estimated Reward',
      type: 'string',
      description: 'e.g., "$1000-3000"'
    },
    {
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          {title: 'Easy', value: 'Easy'},
          {title: 'Medium', value: 'Medium'},
          {title: 'Hard', value: 'Hard'}
        ]
      }
    },
    {
      name: 'deadline',
      title: 'Deadline',
      type: 'datetime'
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Ended', value: 'ended'},
          {title: 'Coming Soon', value: 'coming'}
        ]
      },
      initialValue: 'active'
    },
    {
      name: 'link',
      title: 'Project Link',
      type: 'url'
    },
    {
      name: 'premium',
      title: 'Premium Only',
      type: 'boolean',
      initialValue: false
    }
  ],
  preview: {
    select: {
      title: 'projectName',
      chain: 'chain',
      premium: 'premium',
      status: 'status'
    },
    prepare({title, chain, premium, status}) {
      return {
        title: title,
        subtitle: `${chain || ''} | ${status || 'active'} ${premium ? '⭐' : ''}`
      }
    }
  }
}
```

## 3. Signal Schema (schemas/signal.js)

```javascript
export default {
  name: 'signal',
  title: 'Early Signal',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'type',
      title: 'Signal Type',
      type: 'string',
      options: {
        list: [
          {title: 'Opportunity', value: 'opportunity'},
          {title: 'Alert', value: 'alert'},
          {title: 'News', value: 'news'},
          {title: 'Community', value: 'community'}
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          {title: 'Urgent', value: 'urgent'},
          {title: 'High', value: 'high'},
          {title: 'Medium', value: 'medium'},
          {title: 'Low', value: 'low'}
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
    },
    {
      name: 'action',
      title: 'Recommended Action',
      type: 'string',
      description: 'What should users do? (optional)'
    },
    {
      name: 'link',
      title: 'Link',
      type: 'url',
      description: 'External link for more info (optional)'
    },
    {
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'premium',
      title: 'Premium Only',
      type: 'boolean',
      initialValue: false
    }
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'timestampDesc',
      by: [
        {field: 'timestamp', direction: 'desc'}
      ]
    },
    {
      title: 'Priority',
      name: 'priorityAsc',
      by: [
        {field: 'priority', direction: 'asc'}
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      priority: 'priority',
      premium: 'premium'
    },
    prepare({title, type, priority, premium}) {
      const priorityEmoji = {
        urgent: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢'
      }
      return {
        title: title,
        subtitle: `${priorityEmoji[priority] || ''} ${type} ${premium ? '⭐' : ''}`
      }
    }
  }
}
```

## 4. Schema Index (schemas/index.js)

```javascript
import article from './article'
import airdrop from './airdrop'
import signal from './signal'

export const schemaTypes = [article, airdrop, signal]
```

---

## Setup Instructions

1. Go to your Sanity Studio project
2. Create the files above in the `schemas/` folder
3. Update `schemas/index.js` to export all schemas
4. Run `sanity deploy` to update your studio
5. Add content through the Sanity Studio UI

## API Field Mapping

| Sanity Field | API Field |
|--------------|-----------|
| `_id` | `id` |
| `projectName` | `project_name` |
| `logoUrl` | `logo_url` |
| `fullDescription` | `full_description` |
| `rewardNote` | `reward_note` |
| `estimatedReward` | `estimated_reward` |
| `publishedAt` | `published_at` |
| `imageUrl` | `image_url` |

The backend automatically transforms Sanity's camelCase to the API's snake_case format.
