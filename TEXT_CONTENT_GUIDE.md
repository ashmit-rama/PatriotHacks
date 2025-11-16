# Where to Change Text on the Website

This guide shows you where all the text content is located in the codebase.

## Main Content Sections

### 1. Hero Section (Landing Page Top)
**File:** `frontend/src/components/HeroSection.js`

- **Title:** Line 76-79 - "Build your product. We'll handle the blockchain."
- **Subtitle:** Line 81-84 - Description paragraph
- **Feature Labels:** Line 14-20 - "Smart Contracts", "Governance", "Tokenomics", etc.
- **Button Text:** Line 104-110 - "Start building" and "Learn more"

### 2. Problem Section ("Why Web3 Founders Struggle")
**File:** `frontend/src/components/ProblemSection.js`

- **Title & Subtitle:** Line 115-118 - Passed to SectionHeader component
- **Challenge Items:** Line 8-58 - Array of challenges with titles and descriptions
  - Each challenge has: `title`, `description`, `icon`

### 3. Product Overview Section ("From Idea to Launch")
**File:** `frontend/src/components/ProductOverviewSection.js`

- **Title & Subtitle:** Line 37-40 - Passed to SectionHeader component
- **Feature Cards:** Line 7-32 - Array of features with:
  - `title` (e.g., "Smart Contract Engine")
  - `description` (the paragraph text)

### 4. How It Works Section
**File:** `frontend/src/components/HowItWorksSection.js`

- **Title & Subtitle:** Line 28-31 - Passed to SectionHeader component
- **Steps:** Line 7-23 - Array of steps with:
  - `number` (1, 2, 3)
  - `title` (e.g., "Type your idea")
  - `description` (the paragraph text)

### 5. Footer
**File:** `frontend/src/components/Footer.js`

- **Footer Links:** Line 5-25 - Object with categories and links
- **Copyright:** Line 44 - "© {year} Kairo. All rights reserved."

### 6. Navbar
**File:** `frontend/src/components/Navbar.js`

- **Tab Names:** Line 18-32 - "Home", "Build", "Projects"
- **Button Text:** Line 36-38 - "Docs", "Get Started"

### 7. Build Section (Form Page)
**File:** `frontend/src/components/BuildSection.js`

- **Form Labels:** Check the JSX around line 125-180
- **Button Text:** "Generate Framework", "Download Starter Project (.zip)"
- **Error Messages:** Various error strings throughout

### 8. Final CTA Section
**File:** `frontend/src/components/FinalCTASection.js`

- **Title & Button Text:** Check the component file

## Page Metadata

### Browser Title & Meta Tags
**File:** `frontend/public/index.html`

- **Page Title:** Line 27 - `<title>Kairo</title>`
- **Meta Description:** Line 8-11 - Description for search engines

### App Manifest
**File:** `frontend/public/manifest.json`

- **App Name:** Line 2-3 - "Kairo"

## Quick Reference

| What You Want to Change | File Location |
|------------------------|---------------|
| Main hero headline | `HeroSection.js` line 76-79 |
| Hero description | `HeroSection.js` line 81-84 |
| Feature list items | `HeroSection.js` line 14-20 |
| Section titles/subtitles | `ProblemSection.js`, `ProductOverviewSection.js`, `HowItWorksSection.js` |
| Challenge descriptions | `ProblemSection.js` line 8-58 |
| Feature card content | `ProductOverviewSection.js` line 7-32 |
| Step descriptions | `HowItWorksSection.js` line 7-23 |
| Footer links | `Footer.js` line 5-25 |
| Navbar tabs | `Navbar.js` line 18-32 |
| Browser tab title | `index.html` line 27 |

## Tips

1. **Section Headers:** Many sections use the `SectionHeader` component. The title and subtitle are passed as props in each section file.

2. **Arrays:** Most content is stored in arrays (like `features`, `challenges`, `steps`). You can add, remove, or modify items in these arrays.

3. **Styling:** Text styling is in the corresponding `.css` files (e.g., `HeroSection.css`). Only change text content in the `.js` files.

4. **After Changes:** After modifying text, the React dev server should automatically reload. If not, refresh your browser.

