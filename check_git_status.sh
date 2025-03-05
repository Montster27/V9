#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09
echo "Current branch:"
git branch --show-current
echo -e "\nAll branches:"
git branch
echo -e "\nRemote branches:"
git branch -r
