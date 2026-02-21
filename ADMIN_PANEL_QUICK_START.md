# Admin Panel Quick Start Guide

## Accessing the Admin Panel
1. Start your development server: `npm run dev:full`
2. Open browser: `http://localhost:8080/admin`

## Admin Routes
- `/admin` - Main dashboard
- `/admin/notifications` - Manage notifications
- `/admin/updates` - Manage updates
- `/admin/resources` - Manage resources
- `/admin/events` - Manage events
- `/admin/spotlight` - Manage spotlight items
- `/admin/testimonials` - Manage testimonials

## What Each Section Does

### 📬 Notifications
Add system-wide notifications that users see. Perfect for important announcements.
- **Add**: Title + Description only
- **Display**: Home page notifications panel

### 📰 Updates
Post platform updates with priority levels.
- **Add**: Title, Description, Images, Priority
- **Display**: `/updates` page
- **Priority**: Low (blue), Medium (yellow), High (red)

### 📚 Resources
Create detailed learning resources with multiple images and files.
- **Add**: Title, Description, Long Desc, Tags, Images, Files
- **Display**: `/resources` page with individual detail pages
- **Features**: Click any resource to see full details with gallery and downloads

### 🎉 Events
Announce upcoming events with registration links.
- **Add**: Title, Description, Date, Time, Location, Registration Link, Image
- **Display**: Can be shown on spotlight or dedicated events page
- **Features**: Full event details with date/time and registration

### ✨ Spotlight
Feature success stories and achievements.
- **Add**: Title, Description, Multiple Images
- **Display**: `/spotlight` page
- **Features**: Image gallery with hover effects

### 💬 Testimonials
Add user feedback and testimonials.
- **Add**: Name, Title/Role, Content, Profile Image
- **Display**: Home page testimonials section
- **Features**: Auto-generates initials if no image

## Data Storage
All data is automatically saved to JSON files in `/public/data/`:
- No database needed
- Changes persist across restarts
- Easy to backup and share

## Important Notes

⚠️ **Security**: The current system has no authentication. Add authentication before making public.

💡 **Images**: Stored as base64 in JSON files. Keep file sizes reasonable.

🔄 **Refreshing**: Click "Refresh List" button to reload items from server after creating them.

📱 **Mobile**: Admin panel is responsive but designed for desktop use.

🎯 **Performance**: Works great for small to medium datasets. If adding 1000+ items, consider migrating to a database.

## Form Tips

- **Required fields**: Marked clearly, must be filled
- **Images**: Click file input to upload from computer
- **Tags**: Press Enter or click "Add" button to add tags to resources
- **Multiple images**: Upload one at a time
- **Long descriptions**: Use for detailed resource information (appears on detail page)
- **Registration links**: Optional for events, use for event registration URLs

## Creating Your First Item

1. Go to `/admin`
2. Click "Notifications" card
3. Fill in:
   - Title: "Welcome to FeedX!"
   - Description: "Check out our new resources"
4. Click "Create Notification"
5. See it in the list below
6. Go to home page - you won't see it yet (notifications not shown on home, but they're created!)

## Testing the System

Try adding:
1. A **notification** - Tests basic form
2. An **update** with an image - Tests image upload
3. A **resource** with tags and files - Tests complex form
4. An **event** with date/time - Tests datetime fields
5. A **spotlight** with multiple images - Tests gallery
6. A **testimonial** - Tests on home page

Visit the public pages to see your content displayed!

## Troubleshooting

**Images not showing?**
- Check browser console for errors
- Ensure image files are not too large (< 2MB)
- Try refresh page

**Form not submitting?**
- Check all required fields are filled
- Check browser console for errors
- Ensure server is running on port 3001

**Content not appearing on public pages?**
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh the page
- Check if data was actually created (check admin list)

**Server not responding?**
- Make sure you run: `npm run dev:full` (not just `npm run dev`)
- Check port 3001 is not in use
- Check server logs for errors

---

**Need Help?** Check the main documentation at `/workspaces/feedx-nexus/ADMIN_PANEL_SETUP.md`
