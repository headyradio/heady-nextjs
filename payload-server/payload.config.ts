import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOrigins = (process.env.PAYLOAD_CORS ?? 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const csrfOrigins = (process.env.PAYLOAD_CSRF ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  secret: process.env.PAYLOAD_SECRET || 'change-me',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === 'false'
          ? false
          : {
              rejectUnauthorized: false,
            },
    },
  }),
  admin: {
    user: 'users',
  },
  cors: corsOrigins,
  csrf: csrfOrigins.length ? csrfOrigins : undefined,
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [
        {
          name: 'role',
          type: 'select',
          options: ['admin', 'editor'],
          defaultValue: 'editor',
          required: false,
        },
      ],
    },
    {
      slug: 'heroCards',
      access: {
        read: () => true, // public read for frontend
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'genreTags',
          type: 'array',
          fields: [{ name: 'tag', type: 'text' }],
        },
        { name: 'dj', type: 'text' },
        { name: 'dateTime', type: 'date' },
        { name: 'destinationUrl', type: 'text' },
      ],
    },
    {
      slug: 'media',
      upload: {
        staticDir: path.resolve(__dirname, 'media'),
      },
      fields: [{ name: 'alt', type: 'text' }],
    },
  ],
});



