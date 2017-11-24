#!/bin/bash

ssh ubuntu@collegecode.org <<'ENDSSH'
cd VITacademics-Unlimited/
git stash
git pull
npm install
cp ../faculty_info.json data/
cp ../late_schools.json data/
pm2 gracefulReload VITacademics
ENDSSH
