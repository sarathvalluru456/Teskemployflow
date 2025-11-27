# TaskEmployeeFlow - Design Guidelines

## Design Approach
**Selected System: Linear-inspired Design System**

This productivity application requires clarity, efficiency, and professional polish. Drawing inspiration from Linear's refined aesthetic combined with Material Design's component patterns, we'll create a focused, distraction-free interface optimizing task management workflows.

**Core Principles:**
- Clarity over decoration
- Consistent spatial rhythm
- Purposeful typography hierarchy
- Efficient information density

---

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts)
- Monospace: JetBrains Mono (for task IDs, timestamps)

**Hierarchy:**
- Hero/Page Titles: text-3xl to text-4xl, font-semibold
- Section Headers: text-xl to text-2xl, font-semibold
- Card Titles/Labels: text-base, font-medium
- Body Text: text-sm to text-base, font-normal
- Helper/Meta Text: text-xs to text-sm, text-gray-600

---

## Layout & Spacing System

**Tailwind Spacing Units: 2, 4, 6, 8, 12, 16**

**Application Structure:**
- Sidebar navigation: Fixed width (w-64), full height
- Main content area: Flex-grow with max-w-7xl container
- Content padding: p-6 to p-8 on desktop, p-4 on mobile

**Vertical Rhythm:**
- Section spacing: mb-8 to mb-12
- Card/component spacing: gap-4 to gap-6
- Form field spacing: space-y-4
- Inline element gaps: gap-2 to gap-4

---

## Core Components

### Authentication Pages (Login/Register)
- Centered card layout (max-w-md mx-auto, centered vertically)
- Clean form design with label-above-input pattern
- Role toggle/selector for Manager vs Employee (pill-style toggle buttons)
- Branding header with app name and tagline
- Footer with role information and security note
- Subtle decorative element: Diagonal gradient background pattern (not full image)

### Navigation System

**Manager Sidebar:**
- Dashboard (overview icon)
- Tasks (checklist icon)
- Employees (users icon)
- Settings (gear icon)
- Profile section at bottom with avatar and name

**Employee Sidebar:**
- My Tasks (checklist icon)
- Submit Complaint (alert icon)
- Profile section

**Sidebar Styling:**
- Navigation items with hover states
- Active state indicator (vertical accent bar + background)
- Icon + label layout with proper spacing (gap-3)

### Dashboard Layouts

**Manager Dashboard:**
- Stats cards row (grid-cols-3): Total Tasks, Active Employees, Pending Complaints
- Recent activity section with timeline-style list
- Quick actions section with primary action buttons

**Employee Dashboard:**
- Task status overview (grid-cols-2 or grid-cols-3): Assigned, In Progress, Completed
- Task list with priority indicators
- Recent complaints status

### Task Components

**Task Card:**
- Compact card design with subtle border
- Header: Title (font-medium) + Status badge
- Body: Description snippet (text-sm, line-clamp-2)
- Meta row: Assignee avatar, due date, priority indicator
- Action buttons (icon-only for compact view)
- Link display with icon (external link indicator)

**Task List View:**
- Table-like structure with alternating row backgrounds
- Columns: Checkbox, Title, Assignee, Status, Due Date, Actions
- Sortable headers
- Bulk actions toolbar (appears on selection)

**Task Creation Modal:**
- Large modal (max-w-2xl)
- Multi-step form or single form with clear sections
- Rich text editor for description
- Employee assignment dropdown with search
- Task link input with validation indicator
- Priority and due date selectors

### Employee Management

**Employee Table:**
- Clean data table with search and filter bar
- Columns: Name, Email, Role Badge, Status (Active/Inactive), Actions
- Add Employee button (prominent, top-right)
- Credential view toggle (eye icon, shows/hides password column)

**Add Employee Form:**
- Modal or slide-over panel
- Fields: Name, Email, Password (with generator option), Role selector
- Preview of login credentials before final save

### Complaint System

**Complaint Submission (Employee):**
- Full-width form with rich text area
- Category selector (dropdown or button group)
- Attachment option (file upload area)
- Priority level selector

**Complaint Management (Manager):**
- List view with status indicators (New, In Review, Resolved)
- Filter by status and employee
- Quick action buttons: Resolve, Add Note
- Expanded view shows full complaint details and resolution history

---

## Component Patterns

**Buttons:**
- Primary: Solid, font-medium, px-4 py-2
- Secondary: Outlined, font-medium, px-4 py-2
- Tertiary/Ghost: Text-only with hover background
- Icon buttons: Square (w-10 h-10), centered icon

**Form Inputs:**
- Consistent height (h-10 for text inputs)
- Clear labels (text-sm font-medium mb-2)
- Placeholder text for guidance
- Error states with helper text below
- Disabled state styling

**Cards:**
- Rounded corners (rounded-lg)
- Subtle borders (border border-gray-200)
- Padding: p-4 to p-6
- Hover elevation for interactive cards (subtle shadow)

**Badges:**
- Pill-shaped (rounded-full)
- Size: px-3 py-1, text-xs font-medium
- Status-specific (e.g., "Active", "Pending", "Completed")

**Modals:**
- Semi-transparent backdrop (backdrop-blur-sm)
- Centered modal with max-width constraints
- Header with title and close button
- Footer with action buttons (right-aligned)

**Tables:**
- Header row with font-medium
- Alternating row backgrounds for readability
- Hover state on rows
- Responsive: Stack on mobile or horizontal scroll

---

## Icons
**Library: Heroicons (via CDN)**
- Use outline version for navigation
- Use solid version for status indicators and badges
- Consistent sizing: w-5 h-5 for inline, w-6 h-6 for buttons

---

## Responsive Behavior

**Breakpoints:**
- Mobile: Base (single column layouts)
- Tablet: md (sidebar becomes drawer/hamburger)
- Desktop: lg+ (full sidebar visible)

**Mobile Adaptations:**
- Sidebar collapses to hamburger menu
- Stats cards stack (grid-cols-1)
- Tables scroll horizontally or transform to cards
- Modals become full-screen on mobile

---

## Animations
**Minimal, purposeful transitions:**
- Page transitions: Fade in content (150ms)
- Dropdown/modal open: Scale + fade (200ms ease-out)
- Hover states: Background transition (150ms)
- Loading states: Subtle spinner or skeleton screens

---

This design system creates a professional, efficient task management interface that prioritizes usability while maintaining visual polish appropriate for a business productivity tool.