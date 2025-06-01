// Simple test to verify tag system compilation
console.log("Testing tag system...");

// Simulate session storage operations
const sessionStorage = {
  data: {},
  setItem(key, value) {
    this.data[key] = value;
    console.log(`✅ Set ${key}=${value}`);
  },
  getItem(key) {
    const value = this.data[key] || null;
    console.log(`📖 Get ${key}=${value}`);
    return value;
  },
  removeItem(key) {
    delete this.data[key];
    console.log(`🗑️ Removed ${key}`);
  }
};

// Simulate a login flow
console.log("\n🔐 Simulating login flow...");

// User logs in (mock user data)
const mockUser = {
  id: "user123",
  email: "test@example.com",
  tags: [] // No tags yet
};

console.log("User data:", mockUser);

// Check if user needs tag prompt
const needsTagPrompt = !mockUser.tags || mockUser.tags.length === 0;
console.log("Needs tag prompt:", needsTagPrompt);

if (needsTagPrompt) {
  console.log("🏷️ Setting trigger flag for tag prompt");
  sessionStorage.setItem('triggerTagPromptAfterLogin', 'true');
  sessionStorage.removeItem('skippedTagPrompt');
  sessionStorage.removeItem('lastCheckedUserId');
}

// Simulate navigation (like going to /home)
console.log("\n🚀 Simulating navigation to /home...");

// Simulate tag manager checking for triggers
console.log("\n🏷️ Tag manager checking for triggers...");
const shouldTriggerAfterLogin = sessionStorage.getItem('triggerTagPromptAfterLogin') === 'true';

if (shouldTriggerAfterLogin) {
  console.log("✅ Found login trigger! Should open tag prompt.");
  sessionStorage.removeItem('triggerTagPromptAfterLogin');
  console.log("🎯 Tag prompt would open here!");
} else {
  console.log("❌ No login trigger found.");
}

console.log("\n📊 Final session storage state:");
Object.keys(sessionStorage.data).forEach(key => {
  console.log(`  ${key}: ${sessionStorage.data[key]}`);
});

console.log("\n✅ Tag system test completed!");
