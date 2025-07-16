#!/bin/sh
# Wait for MySQL to be ready
until nc -z -v -w30 mysql 3306
do
  echo "Waiting for MySQL connection..."
  sleep 5
done

npx prisma generate
npx prisma db push
npm run build
npm run start:dev
