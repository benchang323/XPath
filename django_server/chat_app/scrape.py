# Scrape all the files in trips folder into a single txt file (so all the code)

import os
import re

def scrape_trips():
    # Get all the files in trips folder
    trips_files = os.listdir('django_server/chat_app')
    trips_files = [file for file in trips_files if file.endswith('.py')]

    # Scrape all the code from the files
    code = ''
    for file in trips_files:
        with open(f'django_server/chat_app/{file}', 'r') as f:
            code += f.read()
            code += '\n\n'

    # Write the code to a file
    with open('chat_app_code.txt', 'w') as f:
        f.write(code)
        
scrape_trips()