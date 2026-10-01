# User Dashboard Refactoring

## 📁 Project Structure

```
C:\Users\fedy2\OneDrive\Bureau\Viaitalia\frontend\src\pages\user\
│
├── UserDashboard.jsx (Main orchestrator component)
│
├── components/
│   ├── Header/
│   │   ├── Header.jsx (Main container)
│   │   ├── Header.styles.js (Styled components)
│   │   └── index.js (Export)
│   │
│   ├── Sidebar/
│   │   ├── Sidebar.jsx (Main container)
│   │   ├── Sidebar.styles.js (Styled components)
│   │   └── index.js (Export)
│   │
│   ├── BottomNav/
│   │   ├── BottomNav.jsx (Mobile navigation)
│   │   ├── BottomNav.styles.js (Styled components)
│   │   └── index.js (Export)
│   │
│   ├── ContentArea/
│   │   ├── ContentArea.jsx (Wrapper container)
│   │   ├── ContentArea.styles.js (Styled components)
│   │   └── index.js (Export)
│   │
│   └── sections/
│       ├── Appointments/ (TODO)
│       ├── Messaging/ (TODO)
│       ├── University/ (TODO)
│       ├── Contracts/ (TODO)
│       ├── Dossier/ (TODO)
│       └── Announcements/ (TODO)
│
├── hooks/
│   ├── useAppointments.js ✅
│   ├── useMessaging.js ✅
│   ├── useUniversityInfo.js ✅
│   ├── useContracts.js ✅
│   ├── useDossier.js ✅
│   ├── useAnnouncements.js ✅
│   └── useNotifications.js ✅
│
├── utils/
│   ├── animations.js ✅
│   ├── helpers.js ✅
│   └── formatters.js ✅
│
├── styles/
│   ├── DashboardContainer.styles.js ✅
│   └── shared.styles.js ✅
│
└── README.md (This file)
```

## 🎯 Completed Components

### ✅ Layout Components

#### **Header Component**
- **Location**: `components/Header/`
- **Features**:
  - Logo and branding
  - Notification dropdown with badge
  - User avatar and logout button
  - Responsive design
  - GSAP animations
- **Props**: `{ onLogout }`
- **Usage**: `<Header onLogout={handleLogout} />`

#### **Sidebar Component**
- **Location**: `components/Sidebar/`
- **Features**:
  - Navigation menu with active state
  - User info display
  - Badge support for notifications
  - Smooth animations
  - Desktop-only (hidden on mobile)
- **Props**: `{ activeMenu, menuItems, onMenuClick }`
- **Usage**: `<Sidebar activeMenu={activeMenu} menuItems={menuItems} onMenuClick={handleMenuClick} />`

#### **BottomNav Component**
- **Location**: `components/BottomNav/`
- **Features**:
  - Mobile navigation (visible only on mobile)
  - Active state indicators
  - Badge support
  - Center item highlighting
  - Touch-friendly design
- **Props**: `{ activeMenu, menuItems, onMenuClick }`
- **Usage**: `<BottomNav activeMenu={activeMenu} menuItems={menuItems} onMenuClick={handleMenuClick} />`

#### **ContentArea Component**
- **Location**: `components/ContentArea/`
- **Features**:
  - Content wrapper with animations
  - Loading, error, and empty states
  - Responsive grid and flex layouts
  - Background effects
  - Transition animations
- **Props**: `{ activeMenu, children, title, subtitle, isLoading, error, isEmpty }`
- **Usage**: `<ContentArea activeMenu={activeMenu} title="Title">{children}</ContentArea>`

### ✅ Custom Hooks

#### **useAppointments**
- **Location**: `hooks/useAppointments.js`
- **Features**: CRUD operations for appointments
- **Returns**: `{ appointments, isLoading, createAppointment, deleteAppointment, ... }`

#### **useMessaging**
- **Location**: `hooks/useMessaging.js`
- **Features**: Message management and sending
- **Returns**: `{ messages, isLoading, sendMessage, newMessage, ... }`

#### **useUniversityInfo**
- **Location**: `hooks/useUniversityInfo.js`
- **Features**: University selection management
- **Returns**: `{ universityInfo, isSaving, saveUniversityInfo, ... }`

#### **useContracts**
- **Location**: `hooks/useContracts.js`
- **Features**: Contract upload and status management
- **Returns**: `{ contractStatus, uploadContract, contractFile, ... }`

#### **useDossier**
- **Location**: `hooks/useDossier.js`
- **Features**: Dossier progress tracking
- **Returns**: `{ dossier, calculateProgress, getStepStatus, ... }`

#### **useAnnouncements**
- **Location**: `hooks/useAnnouncements.js`
- **Features**: Announcement management
- **Returns**: `{ announcements, getAnnouncementType, formatRelativeTime, ... }`

#### **useNotifications**
- **Location**: `hooks/useNotifications.js`
- **Features**: Notification management
- **Returns**: `{ notifications, unreadCount, markAllAsRead, ... }`

### ✅ Utility Files

#### **animations.js**
- **Location**: `utils/animations.js`
- **Features**: GSAP animation helpers
- **Exports**: `animateHeaderFadeDown`, `animateSidebarSlide`, `animateContentCards`, etc.

#### **helpers.js**
- **Location**: `utils/helpers.js`
- **Features**: General utility functions
- **Exports**: `formatDate`, `getStatusColor`, `validateEmail`, `debounce`, etc.

#### **formatters.js**
- **Location**: `utils/formatters.js`
- **Features**: Data formatting functions
- **Exports**: `formatAppointment`, `formatMessage`, `formatUniversitySelection`, etc.

### ✅ Style Files

#### **DashboardContainer.styles.js**
- **Location**: `styles/DashboardContainer.styles.js`
- **Features**: Main layout and responsive utilities
- **Exports**: `DashboardContainer`, `MainContent`, `ContentArea`, etc.

#### **shared.styles.js**
- **Location**: `styles/shared.styles.js`
- **Features**: Reusable styled components
- **Exports**: `ContentCard`, `Button`, `Input`, `Badge`, `Notification`, etc.

## 🔄 Pending Components

### 📋 Section Components (TODO)

#### **AppointmentsSection**
- **Location**: `components/sections/Appointments/`
- **Sub-components**: `BookingForm`, `AppointmentsList`
- **Status**: ⏳ Pending

#### **MessagingSection**
- **Location**: `components/sections/Messaging/`
- **Sub-components**: `ChatContainer`, `MessageInput`, `ContactInfo`
- **Status**: ⏳ Pending

#### **UniversitySection**
- **Location**: `components/sections/University/`
- **Sub-components**: `UniversityForm`, `UniversitySummary`, `ConfirmationModal`
- **Status**: ⏳ Pending

#### **ContractsSection**
- **Location**: `components/sections/Contracts/`
- **Sub-components**: `ContractViewer`, `ContractUpload`, `ContractStatus`
- **Status**: ⏳ Pending

#### **DossierSection**
- **Location**: `components/sections/Dossier/`
- **Sub-components**: `DossierTimeline`, `DossierStep`, `ProgressBar`
- **Status**: ⏳ Pending

#### **AnnouncementsSection**
- **Location**: `components/sections/Announcements/`
- **Sub-components**: `AnnouncementsGrid`
- **Status**: ⏳ Pending

## 🚀 Usage Examples

### **Main UserDashboard Structure**

```jsx
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ContentArea } from './components/ContentArea';
import { useAppointments } from './hooks/useAppointments';
import { useMessaging } from './hooks/useMessaging';
// ... other hooks

const UserDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('rendezvous');
  
  // Custom hooks
  const appointmentsHook = useAppointments(user?.id);
  const messagingHook = useMessaging(user?.id);
  // ... other hooks
  
  const menuItems = [
    { id: 'rendezvous', icon: '📅', text: 'Rendez-vous' },
    { id: 'messagerie', icon: '💬', text: 'Messagerie' },
    // ... other items
  ];
  
  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
  };
  
  const handleLogout = () => {
    // Logout logic
  };
  
  const renderContent = () => {
    switch(activeMenu) {
      case 'rendezvous':
        return <AppointmentsSection {...appointmentsHook} />;
      case 'messagerie':
        return <MessagingSection {...messagingHook} />;
      // ... other cases
      default:
        return null;
    }
  };
  
  return (
    <>
      <Header onLogout={handleLogout} />
      <Sidebar 
        activeMenu={activeMenu}
        menuItems={menuItems}
        onMenuClick={handleMenuClick}
      />
      <ContentArea activeMenu={activeMenu}>
        {renderContent()}
      </ContentArea>
      <BottomNav 
        activeMenu={activeMenu}
        menuItems={menuItems}
        onMenuClick={handleMenuClick}
      />
    </>
  );
};

export default UserDashboard;
```

### **Custom Hook Usage**

```jsx
import { useAppointments } from '../hooks/useAppointments';

const AppointmentsSection = () => {
  const {
    appointments,
    isLoading,
    isCreating,
    newAppointment,
    createAppointment,
    deleteAppointment,
    handleInputChange,
    resetNewAppointment
  } = useAppointments(user?.id);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAppointment(newAppointment);
      resetNewAppointment();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };
  
  return (
    <ContentArea
      title="Rendez-vous"
      isLoading={isLoading}
      isEmpty={appointments.length === 0}
      emptyMessage="Aucun rendez-vous"
    >
      {/* Your appointment UI here */}
    </ContentArea>
  );
};
```

### **Animation Usage**

```jsx
import { animateButtonHover, animateButtonClick } from '../utils/animations';
import { Button } from '../styles/shared.styles';

const MyComponent = () => {
  const buttonRef = useRef(null);
  
  const handleMouseEnter = () => {
    if (buttonRef.current) {
      animateButtonHover(buttonRef.current);
    }
  };
  
  const handleClick = () => {
    if (buttonRef.current) {
      animateButtonClick(buttonRef.current);
    }
  };
  
  return (
    <Button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      Click me
    </Button>
  );
};
```

## 🎨 Styling Guidelines

### **Using Shared Styles**

```jsx
import { ContentCard, Button, Badge } from '../styles/shared.styles';

const MyComponent = () => {
  return (
    <ContentCard>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Badge variant="success">Success Badge</Badge>
    </ContentCard>
  );
};
```

### **Responsive Design**

All components are built with responsive design in mind:

- **Desktop**: Full sidebar, header, content area
- **Tablet**: Narrower sidebar, adjusted spacing
- **Mobile**: Bottom navigation, collapsed header, full-width content

### **Animation Guidelines**

- Use GSAP animations from `utils/animations.js`
- Keep animations subtle and performant
- Add stagger effects for lists and grids
- Use transition states for content switching

## 🔧 Development Guidelines

### **Component Structure**

Each component follows this structure:
```
ComponentName/
├── ComponentName.jsx (Main logic)
├── ComponentName.styles.js (Styled components)
└── index.js (Exports)
```

### **Hook Structure**

Each hook follows this pattern:
- State management with useState/useEffect
- API calls with error handling
- Loading states
- Return object with all necessary data and functions

### **File Naming**

- Use PascalCase for components
- Use camelCase for hooks and utilities
- Use kebab-case for style files

## 📱 Responsive Breakpoints

- **Mobile**: `max-width: 768px`
- **Tablet**: `769px - 1024px`
- **Desktop**: `min-width: 1025px`

## 🎯 Key Benefits

✅ **Modularity**: Each component has single responsibility  
✅ **Maintainability**: Easy to locate and update specific features  
✅ **Reusability**: Components can be imported elsewhere  
✅ **Scalability**: Easy to add new sections or features  
✅ **Testability**: Components can be tested in isolation  
✅ **Performance**: Optimized animations and responsive design  
✅ **Collaboration**: Clear file structure for team development  

## 🔄 Migration Status

| Component | Status | Priority |
|-----------|--------|----------|
| Header | ✅ Complete | High |
| Sidebar | ✅ Complete | High |
| BottomNav | ✅ Complete | High |
| ContentArea | ✅ Complete | High |
| Custom Hooks | ✅ Complete | High |
| Utilities | ✅ Complete | Low |
| Styles | ✅ Complete | Low |
| AppointmentsSection | ⏳ Pending | Medium |
| MessagingSection | ⏳ Pending | Medium |
| UniversitySection | ⏳ Pending | Medium |
| ContractsSection | ⏳ Pending | Medium |
| DossierSection | ⏳ Pending | Medium |
| AnnouncementsSection | ⏳ Pending | Medium |

## 🚀 Next Steps

1. **Complete Section Components**: Extract all remaining sections from the original UserDashboard
2. **Update Main Component**: Integrate all new components into the main UserDashboard
3. **Testing**: Ensure all functionality works correctly
4. **Performance**: Optimize animations and component rendering
5. **Documentation**: Add inline documentation and examples

## 📞 Support

For questions or issues with the refactored components:

1. Check the component's props interface
2. Review the hook's return values
3. Consult the utility functions for helpers
4. Refer to this README for usage examples

---

**Last Updated**: April 23, 2026  
**Version**: 1.0.0  
**Status**: In Progress - Layout Components Complete
