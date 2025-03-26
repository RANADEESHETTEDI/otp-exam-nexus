
#!/usr/bin/env python3
import os
import subprocess
import platform
import sys
import shutil
from pathlib import Path
import webbrowser
import time

def check_requirements():
    """Check if git, node and npm are installed"""
    requirements = ['git', 'node', 'npm']
    missing = []
    
    for req in requirements:
        try:
            subprocess.run([req, '--version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            print(f"✅ {req} is installed")
        except (subprocess.SubprocessError, FileNotFoundError):
            missing.append(req)
            print(f"❌ {req} is not installed")
    
    if missing:
        print("\n❗ Please install the following requirements before proceeding:")
        for req in missing:
            if req == 'git':
                print("  - Git: https://git-scm.com/downloads")
            elif req in ['node', 'npm']:
                print("  - Node.js (includes npm): https://nodejs.org/en/download/")
        return False
    return True

def clone_repository():
    """Clone the repository from GitHub"""
    repo_url = input("\nEnter the GitHub repository URL (or press Enter to use the current directory): ").strip()
    
    if not repo_url:
        print("Using current directory...")
        return os.getcwd()
    
    # Extract repo name from URL for folder name
    repo_name = repo_url.split('/')[-1]
    if repo_name.endswith('.git'):
        repo_name = repo_name[:-4]
    
    # Check if directory already exists
    if os.path.exists(repo_name):
        overwrite = input(f"Directory '{repo_name}' already exists. Overwrite? (y/n): ").lower()
        if overwrite == 'y':
            shutil.rmtree(repo_name)
        else:
            print("Aborting...")
            sys.exit(1)
    
    try:
        print(f"Cloning repository to {repo_name}...")
        subprocess.run(['git', 'clone', repo_url, repo_name], check=True)
        return os.path.join(os.getcwd(), repo_name)
    except subprocess.SubprocessError as e:
        print(f"Error cloning repository: {e}")
        sys.exit(1)

def install_dependencies(project_dir):
    """Install npm dependencies"""
    try:
        os.chdir(project_dir)
        print("\nInstalling dependencies...")
        subprocess.run(['npm', 'install'], check=True)
        return True
    except subprocess.SubprocessError as e:
        print(f"Error installing dependencies: {e}")
        return False

def run_development_server(project_dir):
    """Run the development server"""
    try:
        os.chdir(project_dir)
        print("\nStarting development server...")
        
        # Start the server as a background process
        if platform.system() == 'Windows':
            process = subprocess.Popen('npm run dev', shell=True)
        else:
            process = subprocess.Popen(['npm', 'run', 'dev'], stdout=subprocess.PIPE)
        
        # Wait for server to start
        print("Server starting, please wait...")
        time.sleep(5)
        
        # Open browser
        webbrowser.open('http://localhost:8080')
        
        print("\n✅ Development server is running!")
        print("🌐 Access your application at: http://localhost:8080")
        print("⚠️ Keep this terminal window open while using the application")
        print("ℹ️ Press Ctrl+C to stop the server when you're done")
        
        # Keep the script running
        try:
            process.wait()
        except KeyboardInterrupt:
            process.terminate()
            print("\nServer stopped")
    
    except subprocess.SubprocessError as e:
        print(f"Error running development server: {e}")
        return False

def main():
    """Main function to orchestrate the download and run process"""
    print("===== Assignment Conduct System Setup =====")
    
    if not check_requirements():
        return
    
    project_dir = clone_repository()
    
    if install_dependencies(project_dir):
        run_development_server(project_dir)

if __name__ == "__main__":
    main()
