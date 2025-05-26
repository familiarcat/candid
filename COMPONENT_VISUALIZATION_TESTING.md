# 🧪 Component-Focused Visualization Testing Plan
## 2-Level Edge Limiting & Data Accuracy Validation

**Date:** 2025-01-15  
**Focus:** Comprehensive testing of component-specific visualizations with 2-level edge limiting  
**Status:** Ready for Testing

---

## 🎯 TESTING OBJECTIVES

### **Primary Goals**
1. **Data Accuracy**: Verify each component shows correct, focused data
2. **Edge Limiting**: Confirm 2-level edge limiting works properly
3. **Component Integration**: Test seamless integration with existing pages
4. **Performance**: Ensure visualizations load quickly and smoothly

### **Secondary Goals**
1. **User Experience**: Validate intuitive navigation between entities
2. **Visual Consistency**: Confirm consistent styling and behavior
3. **Error Handling**: Test graceful degradation with missing data

---

## 📋 DETAILED TEST CASES

### **1. Companies Page Testing**

#### **Test 1.1: Company Selection & Visualization**
- [ ] Navigate to `/companies`
- [ ] Verify company selector appears in header
- [ ] Select different companies from dropdown
- [ ] Click "🌐 Visualize Network" button
- [ ] **Expected**: Modal opens with company-focused network (2 levels max)

#### **Test 1.2: Individual Company Network Buttons**
- [ ] Click "🌐 Network" button on any company card
- [ ] **Expected**: Modal opens with that specific company as root node
- [ ] **Verify**: Only shows hiring authorities (Level 1) and their connections (Level 2)
- [ ] **Verify**: No nodes beyond 2 levels from company

#### **Test 1.3: Data Contract Validation**
- [ ] Open company network visualization
- [ ] **Verify**: Company node is prominently displayed (larger, centered)
- [ ] **Verify**: Hiring authorities connected to company
- [ ] **Verify**: Job seekers connected to authorities (if matches exist)
- [ ] **Verify**: No orphaned nodes or broken connections

### **2. Data Provider Testing**

#### **Test 2.1: Skill-Focused Data Generation**
```javascript
// Test in browser console:
// 1. Navigate to any page with VisualizationDataProvider
// 2. Open browser console
// 3. Test skill-focused data generation
```
- [ ] Test with existing skill ID
- [ ] **Expected**: Skill as root node
- [ ] **Expected**: Job seekers with that skill (Level 1)
- [ ] **Expected**: Positions requiring that skill (Level 1)
- [ ] **Expected**: Companies posting those positions (Level 2)
- [ ] **Expected**: No nodes beyond Level 2

#### **Test 2.2: Position-Focused Data Generation**
- [ ] Test with existing position ID
- [ ] **Expected**: Position as root node
- [ ] **Expected**: Company that posted position (Level 1)
- [ ] **Expected**: Required skills (Level 1)
- [ ] **Expected**: Hiring authorities at company (Level 2)
- [ ] **Expected**: Matched job seekers (Level 1)

#### **Test 2.3: Match-Focused Data Generation**
- [ ] Test with existing match ID
- [ ] **Expected**: Job seeker and hiring authority as dual root nodes
- [ ] **Expected**: Company employing authority (Level 1)
- [ ] **Expected**: Shared skills between job seeker and authority (Level 1)
- [ ] **Expected**: No additional connections beyond Level 2

### **3. Hook Integration Testing**

#### **Test 3.1: useComponentVisualization Hook**
- [ ] Test hook with different component types
- [ ] **Verify**: Returns correct available entities
- [ ] **Verify**: Generates focused data when entity selected
- [ ] **Verify**: Controls work properly (open/close modal, switch entities)

#### **Test 3.2: Page-Level Integration**
- [ ] Test pageHelpers.renderVisualizationButton()
- [ ] Test pageHelpers.renderEntitySelector()
- [ ] Test pageHelpers.getModalProps()
- [ ] **Verify**: All helpers return valid React components/props

### **4. Root Node Processor Testing**

#### **Test 4.1: 2-Level Edge Limiting**
- [ ] Generate network with many connected entities
- [ ] **Verify**: Only nodes within 2 levels are included
- [ ] **Verify**: Root node is properly emphasized (larger, different color)
- [ ] **Verify**: Distance-based opacity/sizing works correctly

#### **Test 4.2: Layout and Visual Enhancement**
- [ ] Test radial layout positioning
- [ ] **Verify**: Root node is centered
- [ ] **Verify**: Level 1 nodes form inner circle
- [ ] **Verify**: Level 2 nodes form outer circle
- [ ] **Verify**: No overlapping or crowded layouts

---

## 🔧 MANUAL TESTING PROCEDURES

### **Procedure A: End-to-End Company Visualization**
1. Open http://localhost:3001/companies
2. Wait for page to load completely
3. Verify company selector appears in header
4. Select "AI Ventures" from dropdown
5. Click "🌐 Visualize Network"
6. **Verify Modal Contents**:
   - AI Ventures as large, central node
   - Dr. Alex Chen (Founder) connected to company
   - Any matched job seekers connected to Dr. Alex Chen
   - No nodes beyond 2 levels
7. Close modal
8. Click "🌐 Network" on CloudTech Solutions card
9. **Verify**: Different network focused on CloudTech

### **Procedure B: Data Accuracy Cross-Check**
1. Note hiring authorities shown in company cards
2. Open company network visualization
3. **Verify**: Same authorities appear in visualization
4. Check job seeker matches on `/matches` page
5. **Verify**: Matched job seekers appear in company networks
6. Cross-reference with `/hiring-authorities` page
7. **Verify**: Authority details match across pages

### **Procedure C: Performance & Responsiveness**
1. Open company with many connections
2. **Measure**: Time from click to modal open
3. **Expected**: < 500ms for modal to appear
4. **Verify**: Smooth animations and transitions
5. **Test**: Rapid switching between companies
6. **Verify**: No lag or memory leaks

---

## 🐛 KNOWN ISSUES TO WATCH FOR

### **Potential Data Contract Issues**
- [ ] Field name mismatches (id vs _key, companyId vs company)
- [ ] Missing null checks for optional fields
- [ ] Incorrect relationship mappings

### **Potential Performance Issues**
- [ ] Large datasets causing slow rendering
- [ ] Memory leaks from unclosed modals
- [ ] Excessive re-renders on entity switching

### **Potential UI Issues**
- [ ] Modal not closing properly
- [ ] Entity selector not updating
- [ ] Visualization buttons disabled when they should be enabled

---

## ✅ SUCCESS CRITERIA

### **Must Have**
- [ ] All company visualizations show correct 2-level networks
- [ ] No nodes appear beyond 2 levels from root
- [ ] Data matches between pages (companies, authorities, matches)
- [ ] Modal opens/closes smoothly
- [ ] Entity switching works correctly

### **Should Have**
- [ ] Visualizations load in < 500ms
- [ ] Smooth animations and transitions
- [ ] Consistent visual styling
- [ ] Intuitive user interactions

### **Nice to Have**
- [ ] Context switching between related entities
- [ ] Advanced filtering options
- [ ] Export/share functionality

---

## 🚀 NEXT STEPS AFTER TESTING

### **If Tests Pass**
1. **Implement on remaining pages**: job-seekers, hiring-authorities, positions, skills
2. **Add advanced features**: context switching, filtering, sorting
3. **Performance optimization**: virtualization, caching, lazy loading
4. **Mobile optimization**: touch controls, responsive layouts

### **If Tests Fail**
1. **Debug data contract issues**: Fix field mappings and null checks
2. **Optimize performance**: Reduce computation, improve caching
3. **Fix UI issues**: Modal behavior, button states, selector updates
4. **Enhance error handling**: Graceful degradation, user feedback

---

## 📊 TESTING CHECKLIST

### **Pre-Testing Setup**
- [ ] Application running on http://localhost:3001
- [ ] Database seeded with test data
- [ ] Browser console open for debugging
- [ ] Network tab open for performance monitoring

### **Core Functionality**
- [ ] Company page loads without errors
- [ ] Visualization selector appears and works
- [ ] Individual company network buttons work
- [ ] Modal opens with correct data
- [ ] 2-level edge limiting enforced
- [ ] Root node properly emphasized

### **Data Accuracy**
- [ ] Company-authority relationships correct
- [ ] Authority-job seeker matches accurate
- [ ] Skill connections properly mapped
- [ ] No orphaned or incorrect nodes

### **Performance & UX**
- [ ] Fast loading times (< 500ms)
- [ ] Smooth animations
- [ ] Responsive interactions
- [ ] Proper error handling

---

**🎯 Ready to validate our revolutionary component-focused visualization system!**
