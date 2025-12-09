#!/bin/sh

#set -x

# No NEXT_PUBLIC variables to replace (all database config is server-side)
NEXT_VARIABLES="" \


for VAR in ${NEXT_VARIABLES}; do
    eval VAL=\$$VAR
    #find /home/nextjs -type d -name node_modules -prune -o -type f -exec grep -l "REPLACE_ME_${VAR}" {} +

    find /home/nextjs \
        -type d -name node_modules -prune \
        -o -type f -exec \
        sed -e 's|REPLACE_ME_'"${VAR}"'|'"${VAL}"'|g' -i {} +
done

# Run Drizzle migrations before starting the server
echo "Running database migrations..."
node scripts/migrate.js

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
echo "Starting Next.js server..."
HOSTNAME="0.0.0.0" node server.js