#!/bin/bash

ssh root@collegecode.org <<'ENDSSH'
cd VITAcademics-Unlimited/
git stash
git pull
npm install
cp ../faculty_info.json data/
cp ../late_schools.json data/
pm2 gracefulReload VITacademics
ENDSSH
