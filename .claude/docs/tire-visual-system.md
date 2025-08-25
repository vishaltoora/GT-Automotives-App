# Tire Visual System Reference

## Overview
The GT Automotive application uses a visual emoji-based system for tire type identification. This system provides instant visual recognition across all user interfaces while maintaining consistency and accessibility.

## Tire Type Emoji Mapping

### Primary Tire Types
| Tire Type | Emoji | Description | Use Case |
|-----------|-------|-------------|----------|
| `ALL_SEASON` | 🌤️ | All weather conditions | Most common tire type |
| `SUMMER` | ☀️ | Summer sun | High performance in warm weather |
| `WINTER` | ❄️ | Winter snowflake | Cold weather and snow traction |
| `PERFORMANCE` | 🏁 | Racing flag | High-performance vehicles |
| `OFF_ROAD` | 🏔️ | Mountain terrain | Trucks, SUVs, rugged terrain |
| `RUN_FLAT` | 🛡️ | Protection shield | Safety, emergency driving |
| Default/Other | 🛞 | Generic tire | Fallback for unknown types |

## Implementation Details

### Code Usage
```typescript
// Helper function from TireCard.tsx
const getTireEmoji = (type: TireType): string => {
  switch (type) {
    case TireType.ALL_SEASON:
      return '🌤️';
    case TireType.SUMMER:
      return '☀️';
    case TireType.WINTER:
      return '❄️';
    case TireType.PERFORMANCE:
      return '🏁';
    case TireType.OFF_ROAD:
      return '🏔️';
    case TireType.RUN_FLAT:
      return '🛡️';
    default:
      return '🛞';
  }
};
```

### Display Contexts

#### 1. Table View
- **Size:** 50x50px containers
- **Font Size:** 24px
- **Background:** Light gray (#f5f5f5)
- **Border:** 1px solid gray border
- **Purpose:** Replace tire images for consistent, fast-loading display

#### 2. Grid View (Tire Cards)
- **Fallback System:** Shows emoji when tire image fails to load
- **Size:** Dynamically sized based on image container
- **Integration:** Seamless fallback from image → emoji

#### 3. Form Selectors
- **Inline Display:** Emojis shown alongside tire information
- **Accessibility:** Includes title attributes for screen readers

## Accessibility Features

### Screen Reader Support
All emoji implementations include `title` attributes:
```html
<div title="All Season tire">🌤️</div>
<div title="Winter tire">❄️</div>
```

### Color Blind Accessibility
- Emojis provide visual distinction beyond color
- Each type has a unique symbol shape/design
- No reliance on color alone for identification

### High Contrast Support
- Emojis maintain visibility in high contrast modes
- Background colors provide additional contrast
- System respects user's accessibility preferences

## Technical Specifications

### Font Rendering
- **Fallback Fonts:** System emoji fonts (Apple Color Emoji, Segoe UI Emoji, etc.)
- **Cross-Platform:** Consistent rendering across operating systems
- **Performance:** No external font loading required

### Container Specifications
```css
.tire-emoji-container {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 24px;
  border: 1px solid #e0e0e0;
}
```

## Usage Guidelines

### When to Use Emojis vs Images
- **Table Views:** Always use emojis for consistency and performance
- **Grid Views:** Use as fallback when images fail to load
- **Forms/Selectors:** Use emojis for quick visual identification
- **Print/PDF:** Emojis render well in printed materials

### Best Practices
1. **Consistency:** Always use the same emoji for the same tire type
2. **Size Standards:** Maintain consistent sizing across contexts
3. **Accessibility:** Always include descriptive title attributes
4. **Performance:** Emojis load faster than images
5. **Maintenance:** Easy to update and maintain vs image assets

## Browser Compatibility

### Supported Browsers
- **Chrome/Edge:** Full emoji support (Chromium-based)
- **Firefox:** Excellent emoji rendering
- **Safari:** Native Apple emoji support
- **Mobile:** Full support on iOS and Android

### Fallback Strategy
If emojis don't render properly:
1. System will show text fallback (tire type name)
2. Container styling remains consistent
3. Functionality is not affected

## Maintenance & Updates

### Adding New Tire Types
1. Update `TireType` enum in interfaces
2. Add emoji mapping in `getTireEmoji` function
3. Update this documentation
4. Test across all display contexts

### Changing Existing Emojis
1. Consider user familiarity with current emojis
2. Test rendering across browsers/devices
3. Update documentation and examples
4. Consider accessibility impact

## Related Components

### Files Using Tire Emoji System
- `apps/webApp/src/app/components/inventory/TireCard.tsx`
- `apps/webApp/src/app/pages/inventory/TireListSimple.tsx`
- Various form components with tire selection

### Integration Points
- Database: `TireType` enum values
- API: Type field in tire objects  
- Frontend: Display logic in multiple components
- CSS: Styling for emoji containers

---

**Last Updated:** August 25, 2025
**Version:** 1.0
**Status:** ✅ Implemented and Active