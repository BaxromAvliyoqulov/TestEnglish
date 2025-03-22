<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-toggle">
        <button @click="toggleAuth(false)" :class="loginButtonClass">Log In</button>
        <button @click="toggleAuth(true)" :class="registerButtonClass">Sign Up</button>
      </div>

      <form @submit.prevent="showRegister ? register() : login()" class="auth-form">
        <div class="input-group">
          <label for="email">Email:</label>
          <input type="email" v-model="email" required />
        </div>

        <div class="input-group password-group">
          <label for="password">Password:</label>
          <div class="password-wrapper">
            <input :type="passwordVisible ? 'text' : 'password'" v-model="password" required />
            <span @click="togglePasswordVisibility" class="password-icon">
              <i :class="passwordVisible ? ' fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
            </span>
          </div>
        </div>

        <div v-if="showRegister" class="input-group">
          <label for="confirm-password">Confirm Password:</label>
          <input type="password" v-model="confirmPassword" required />
        </div>

        <button type="submit" class="auth-button">{{ showRegister ? "Sign Up" : "Log In" }}</button>
      </form>

      <p>
        <span v-if="!showRegister">Don't have an account?</span>
        <span v-else>Already have an account?</span>
        <a @click="toggleAuthMode" class="link">{{ showRegister ? "Log In" : "Sign Up" }} here</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth"; // Assuming a composable for Firebase authentication

const { email, password, confirmPassword, showRegister, passwordVisible, login, register } = useAuth();

const toggleAuth = (state) => {
  showRegister.value = state;
};

const toggleAuthMode = () => {
  showRegister.value = !showRegister.value;
};

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const loginButtonClass = computed(() => (showRegister.value ? "" : "active"));
const registerButtonClass = computed(() => (showRegister.value ? "active" : ""));
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f5f5;
  padding: 1em;
}

.auth-card {
  background: #fff;
  padding: 2em;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-toggle {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1em;
}

.auth-toggle button {
  flex: 1;
  padding: 0.5em;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: bold;
  transition: color 0.3s, border-bottom 0.3s;
}

.auth-toggle button.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.input-group {
  margin-top: 1em;
}

.input-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.3em;
}

.input-group input {
  width: 100%;
  padding: 0.75em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.password-group .password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-group input {
  width: 100%;
}

.password-icon {
  position: absolute;
  right: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  color: #555;
}

.password-icon:hover {
  color: #007bff;
}

.auth-button {
  width: 100%;
  padding: 0.75em;
  margin-top: 1em;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.link {
  color: #007bff;
  cursor: pointer;
  transition: color 0.3s;
}

.link:hover {
  color: #0056b3;
}
</style>
