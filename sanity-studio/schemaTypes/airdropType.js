import {defineField, defineType} from 'sanity'

export default defineType({
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
      name: 'logoUrl',
      title: 'Project Logo URL',
      type: 'url',
      description: 'URL to the project logo image',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
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
            {name: 'id', type: 'string', title: 'Step ID'},
            {name: 'description', type: 'string', title: 'Step Description'},
            {name: 'completed', type: 'boolean', title: 'Completed', initialValue: false},
          ],
          preview: {
            select: {
              title: 'description',
              subtitle: 'id',
            },
          },
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
      description: 'e.g., "$500-2000" or "1000 tokens"',
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
        layout: 'radio',
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
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Project Link',
      type: 'url',
      description: 'Link to the airdrop/project page',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'premium',
      title: 'Premium Content',
      type: 'boolean',
      description: 'Toggle if this airdrop is exclusive to premium members',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'projectName',
      subtitle: 'estimatedReward',
      status: 'status',
    },
    prepare({title, subtitle, status}) {
      return {
        title,
        subtitle: `${subtitle} • ${status}`,
      }
    },
  },
})