# Campaign Tracking

This document describes the campaign tracking feature for Untendurch.

## Overview

The campaign tracking feature allows tracking the origin of bridge reports through campaign codes. When visitors arrive via a campaign link (e.g., from a QR code or marketing material), their campaign code is stored and associated with any bridges they report during their session.

## How It Works

### 1. Campaign Landing Page

When a user scans a QR code or clicks a campaign link, they arrive at:

```
/campaign/:code
```

Where `:code` is the unique campaign identifier (e.g., `SUMMER2024`, `SCHOOL-VISIT`, etc.).

The landing page:
- Displays a welcome message with the campaign code
- Stores the campaign code in a cookie (valid for 30 days)
- Automatically redirects to the main page after 5 seconds

**Example URL:** `https://untendurch.example.com/campaign/SUMMER2024`

### 2. Cookie Storage

The campaign code is stored in a browser cookie named `untendurch_campaign`:
- **Duration:** 30 days
- **Scope:** Entire site (path=/)
- **Security:** SameSite=Lax, Secure flag when using HTTPS

This means users can report multiple bridges over several sessions, and they will all be associated with the same campaign code.

### 3. Bridge Reporting

When a user creates a bridge report, the system automatically:
- Checks if a campaign cookie exists
- If yes, adds the `campaignCode` field to the Bridge object in the database
- If no, the bridge is saved without a campaign code (normal operation)

This happens transparently in the background - users don't need to do anything special.

### 4. Campaign Results Page

To view the results of a campaign, access:

```
/campaign/:code/results
```

This page displays:
- The campaign code
- The total number of bridges reported with this campaign code
- Real-time count from the database

**Example URL:** `https://untendurch.example.com/campaign/SUMMER2024/results`

## Creating a Campaign

To create a new campaign:

1. Choose a unique campaign code (e.g., `SCHOOL-2024`, `NATURE-EVENT-BERN`)
2. Create a landing page URL: `https://your-domain.com/campaign/YOUR-CODE`
3. Generate a QR code pointing to this URL
4. Share the QR code or URL in your campaign materials

## Technical Details

### Frontend Components

- **`CampaignLandingRoute.tsx`** - Landing page component that stores the campaign code
- **`CampaignResultsRoute.tsx`** - Results page that displays campaign statistics
- **`campaignCookie.ts`** - Utility functions for cookie management
- **`BridgeForm.tsx`** - Modified to include campaign code when saving bridges

### Backend Changes

- **`server.ts`** - Updated to serve SPA routes for campaign pages
- **Bridge Schema** - Added `campaignCode` field (string, optional)

### Database

The `campaignCode` field is added to Bridge objects when a campaign cookie is present:

```javascript
{
  "campaignCode": "SUMMER2024",
  // ... other bridge fields
}
```

## Example Workflow

1. **Setup Campaign:**
   - Campaign code: `NATURE-DAY-2024`
   - Landing URL: `https://untendurch.prolutra.ch/campaign/NATURE-DAY-2024`
   - Create QR code with this URL

2. **Campaign Execution:**
   - Place QR codes on posters, flyers, or display at events
   - Visitors scan the code
   - They see welcome message and are redirected to the main app
   - Cookie is set in their browser

3. **Data Collection:**
   - Visitors use the app to report bridges
   - Each report is automatically tagged with `NATURE-DAY-2024`
   - Data is stored in Parse database

4. **Campaign Monitoring:**
   - Access results at: `https://untendurch.prolutra.ch/campaign/NATURE-DAY-2024/results`
   - See total count of bridges reported through this campaign
   - Monitor in real-time as new bridges are reported

## Privacy Considerations

- Campaign codes are stored in cookies, which users can clear at any time
- No personal information is stored in the campaign cookie
- The campaign code is only used to track which campaign led to a bridge report
- Users can still use the app without any campaign code

## Future Enhancements

Possible future improvements:
- Campaign management interface for creating and managing campaigns
- Detailed analytics (date ranges, geographic distribution)
- Campaign expiration dates
- Multiple campaign codes per user
- Campaign-specific landing page text customization
