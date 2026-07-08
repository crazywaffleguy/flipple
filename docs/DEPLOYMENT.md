# Deployment guide

This is the clean path from ZIP file to public website.

## 1. Unzip the project

Unzip `flipple-project.zip` somewhere easy to find, such as your Desktop or Documents folder.

You should see a folder called:

```text
flipple-project
```

## 2. Open the folder in VS Code

Install VS Code if you do not already have it. Open VS Code, then choose:

```text
File > Open Folder > flipple-project
```

## 3. Install Node.js

Install Node.js 18 or newer from the official Node website if you do not already have it.

Then open VS Code's terminal:

```text
Terminal > New Terminal
```

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 4. Create a GitHub repository

On GitHub, create a new repository. A good name is:

```text
flipple
```

Do not add a README/license/gitignore on GitHub because this project already includes those files.

## 5. Push the local folder to GitHub

In the VS Code terminal, inside `flipple-project`, run:

```bash
git init
git add .
git commit -m "Initial Flipple daily web version"
git branch -M main
git remote add origin https://github.com/crazywaffleguy/flipple.git
git push -u origin main
```

If your GitHub repository name is different, replace the remote URL with the one GitHub shows you.

## 6. Deploy on Vercel

In Vercel:

1. Click **Add New Project**.
2. Select the `flipple` GitHub repository.
3. If it asks for a framework, choose **Other**.
4. Leave build command empty.
5. Leave output directory empty/default.
6. Click **Deploy**.

After deploy, test these URLs:

```text
https://YOUR-PROJECT.vercel.app
https://YOUR-PROJECT.vercel.app/api/daily?mode=normal
https://YOUR-PROJECT.vercel.app/api/daily?mode=cubed
```

## 7. Share test

Open the Vercel URL on your phone. Finish a puzzle and tap **share**.

On iPhone/Android, the native share sheet should open. On desktop, the result should copy to your clipboard.

## 8. Connect flipple.live

The project is already configured to share `https://flipple.live`. After the Vercel preview deployment works, add `flipple.live` to the Vercel project and copy the DNS records Vercel gives you into Cloudflare.

Once DNS verifies, test:

```text
https://flipple.live
https://flipple.live/api/daily?mode=normal
https://flipple.live/api/daily?mode=cubed
```

If the domain ever changes, edit `public/config.js`, commit, and push. Vercel will automatically redeploy.


## Creator links

- GitHub: <https://github.com/crazywaffleguy>
- Linktree: <https://linktr.ee/crazywaffleguy>
