# Git Workflow Guide for AI Agent Collaboration

This guide outlines the standard Git workflow for collaborating with AI agents and team members on this project.

## Basic Branch Management

### 1. Check Current Branch
```bash
git branch    # List local branches
git branch -a # List all branches (local and remote)
```

### 2. Update Your Local Main Branch
```bash
git checkout main
git pull origin main
```

## Feature Development Workflow

### 1. Create and Switch to a New Feature Branch
```bash
git checkout main              # Start from main branch
git pull origin main          # Get latest changes
git checkout -b feature-name  # Create and switch to new branch
```

### 2. Regular Development Cycle
```bash
# Before starting work each day
git pull origin main          # Get latest changes from main
git checkout your-branch      # Switch to your working branch
git merge main               # Update your branch with main's changes

# After making changes
git add .                    # Stage all changes
git commit -m "Description of changes"
git push origin your-branch  # Push to your branch
```

## Pull Request Workflow

### 1. Prepare for Pull Request
```bash
# Update your branch with main first
git checkout main
git pull origin main
git checkout your-branch
git merge main
git push origin your-branch
```

### 2. Create Pull Request (via GitHub)
- Go to GitHub repository
- Click "New Pull Request"
- Select base: main ← compare: your-branch
- Add description and reviewers
- Click "Create Pull Request"

### 3. After Pull Request is Approved
```bash
git checkout main
git pull origin main              # Get the merged changes
git branch -d your-branch         # Delete local branch
git push origin --delete your-branch  # Delete remote branch
```

## Emergency Fixes

### 1. Hotfix Branch
```bash
git checkout main
git checkout -b hotfix-name
# Make fixes
git add .
git commit -m "Fix critical issue X"
git push origin hotfix-name
# Create PR for immediate review
```

## Best Practices

1. **Branch Naming Conventions**
   - Feature branches: `feature/description`
   - Bug fixes: `fix/issue-description`
   - Hotfixes: `hotfix/critical-fix`

2. **Commit Messages**
   - Use clear, descriptive messages
   - Start with verb (Add, Update, Fix, Refactor)
   - Example: "Add user authentication feature"

3. **Pull Request Guidelines**
   - Keep PRs focused and small
   - Include detailed descriptions
   - Reference related issues
   - Request reviews from team members

4. **Conflict Resolution**
```bash
# If conflicts occur during merge
git checkout your-branch
git merge main
# Resolve conflicts in files
git add .
git commit -m "Resolve merge conflicts"
git push origin your-branch
```

## Common Issues and Solutions

### 1. Undo Last Commit (not pushed)
```bash
git reset --soft HEAD~1
```

### 2. Force Push (use carefully!)
```bash
git push -f origin branch-name
```

### 3. Stash Changes Temporarily
```bash
git stash           # Save changes
git stash pop       # Retrieve changes
```

### 4. Update Fork with Original Repo
```bash
git remote add upstream original-repo-url
git fetch upstream
git merge upstream/main
```

## Safety Measures

1. **Before Push**
   - Always pull latest changes
   - Run tests if available
   - Review your changes

2. **Before Merge**
   - Ensure CI/CD checks pass
   - Get required reviews
   - Resolve all conflicts

## AI Agent Specific Instructions

1. **Branch Switching**
   - Always check current branch before operations
   - Save/commit work before switching
   - Pull latest changes after switching

2. **Continuous Integration**
   - Wait for CI checks to complete
   - Address failed checks immediately
   - Document any test modifications

3. **Code Review Process**
   - Respond to all comments
   - Make requested changes in new commits
   - Push updates to same branch

Remember: Communication is key! Always document significant changes and decisions in commit messages and PR descriptions.