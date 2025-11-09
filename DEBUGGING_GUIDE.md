# Debugging Guide for Cart and Category Filter Issues

I've added comprehensive console logging to help diagnose the issues. Follow these steps to identify the root cause:

## 🛒 Cart Functionality Testing

### Step 1: Open Browser Console
1. Open http://localhost:3000 in your browser
2. Open Developer Tools (F12 or Cmd+Option+I on Mac)
3. Go to the **Console** tab

### Step 2: Test Add to Cart
1. Click on "Add to Cart" button for any product
2. Check the console for these logs (with 🛒 emoji):

```
🛒 addToCart called with product: {id: 1, name: "...", price: ..., ...}
🛒 Current cart before adding: []
🛒 New product added, updated cart: [{id: 1, name: "...", quantity: 1, ...}]
🛒 localStorage after update: "[{\"id\":1,...}]"
```

### Step 3: Verify localStorage
1. In DevTools, go to **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Expand **Local Storage** → `http://localhost:3000`
3. Look for the `cart` key
4. Verify it contains the product JSON

### Step 4: Check Cart Page
1. Navigate to the Cart page
2. Check console for these logs:

```
🛒 Cart component - cart from context: [{id: 1, name: "...", ...}]
🛒 Cart component - localStorage cart: "[{\"id\":1,...}]"
```

### What to Look For:
- ✅ If logs show products being added: Context is working
- ❌ If localStorage is empty: localStorage isn't being updated
- ❌ If cart context is empty in Cart component: Context isn't loading from localStorage on init
- ❌ If no logs appear when clicking Add to Cart: Button click handler not firing

---

## 📁 Category Filter Testing

### Step 1: Open Network Tab
1. In Developer Tools, go to the **Network** tab
2. Filter by "Fetch/XHR" requests

### Step 2: Select a Category
1. Click on the Navbar dropdown
2. Select any category (e.g., "Electronics", "Clothing")
3. Check console for these logs:

```
📁 Category selected: Electronics
📁 Navigating to home page from: /product/1
🔍 Category filter applied: Electronics
🔍 Fetching products from: /products/filter?page=0&size=12&sortBy=id&sortDir=asc&category=Electronics
```

### Step 3: Verify API Call
1. In the Network tab, look for a request to `/api/products/filter?category=Electronics...`
2. Click on the request to see:
   - **Request URL**: Should be `http://localhost:8080/api/products/filter?category=...`
   - **Status**: Should be 200 OK
   - **Response**: Should contain filtered products

### What to Look For:
- ✅ If you see "Category selected" log: Navbar handler is working
- ✅ If you see "Fetching products from" log: Home component received category
- ❌ If no API call appears in Network tab: Request isn't being made
- ❌ If API returns empty array: Backend filtering not working
- ❌ If API returns 404/500: Backend endpoint issue

---

## 🔧 Common Issues & Solutions

### Issue 1: Cart Context Not Initializing from localStorage

**Symptom**: Products added but cart always empty on page reload

**Check**: Look at `Context.jsx` - does it load from localStorage on mount?

**Solution**: Context should have:
```javascript
useEffect(() => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    setCart(JSON.parse(savedCart));
  }
}, []);
```

### Issue 2: Category Not Being Passed to Home Component

**Symptom**: Category selection doesn't filter products

**Check**: In console, do you see "Category selected" but NOT "Category filter applied"?

**Solution**: Verify `App.jsx` is passing `selectedCategory` prop to `<Home>`

### Issue 3: API Base URL Misconfiguration

**Symptom**: Network tab shows failed requests or CORS errors

**Check**: Look at `axios.jsx` - is the base URL correct?

**Expected**: `baseURL: 'http://localhost:8080/api'`

---

## 📊 Report Your Findings

After testing, share:
1. Screenshots of console logs when adding to cart
2. Screenshot of localStorage contents
3. Screenshot of Network tab when selecting category
4. Any error messages in console (red text)

This will help identify the exact point of failure!
