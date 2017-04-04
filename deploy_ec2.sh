#!/bin/bash

ssh ubuntu@ec2-35-154-246-61.ap-south-1.compute.amazonaws.com <<'ENDSSH'
cd VITAcademics-Unlimited/
git pull
npm install
cp ../FacultyInformationScraper/faculty_info.json data/
pm2 restart api
ENDSSH
