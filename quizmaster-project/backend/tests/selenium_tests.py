from seleniumbase import BaseCase
import random

class QuizAppTests(BaseCase):

    def generate_random_email(self):
        return f"selenium{random.randint(10000,99999)}@example.com"

    def signup_and_login(self, email=None, password="Password123!"):
        if not email:
            email = self.generate_random_email()
        self.open("http://localhost:5173")

        # Switch to signup
        self.click("button:contains('Create one')")
        self.wait_for_element("button:contains('Create account')", timeout=5)

        # Fill signup form
        self.type("input[type='email']", email)
        self.type("input[type='password']", password)
        self.click("button:contains('Create account')")

        # Wait for main nav (Logout button) to appear
        self.wait_for_element("button:contains('Logout')", timeout=10)
        return email, password

    def test_quiz_flow(self):
        email, password = self.signup_and_login()

        # Start quiz
        self.click("button:contains('Start quiz')")
        self.wait_for_element("input[type='radio']", timeout=10)

        # Pick first option for each question
        radios = self.find_elements("input[type='radio']")
        picked_names = set()
        for r in radios:
            name = r.get_attribute("name")
            if name not in picked_names:
                r.click()
                picked_names.add(name)

        self.click("button:contains('Submit answers')")

        # Wait for result page (Play again button)
        self.wait_for_element("button:contains('Play again')", timeout=10)

    def test_settings_flow(self):
        email, password = self.signup_and_login()

        # Navigate to Settings
        self.click("button:contains('Settings')")
        self.wait_for_element("form", timeout=10)

        # Update display name
        self.type("input[placeholder='How should we greet you?']", "Selenium Test User")
        self.click("button:contains('Save display name')")
        self.wait_for_text("Display name updated", timeout=5)

        # Update email
        new_email = self.generate_random_email()
        self.type("input[type='email']", new_email)
        self.click("button:contains('Save email')")
        self.wait_for_text("Email updated", timeout=5)

    def test_delete_account(self):
        email, password = self.signup_and_login()

        # Navigate to Settings
        self.click("button:contains('Settings')")
        self.wait_for_element("button:contains('Delete account')", timeout=10)

        # Mock confirm to always return true
        self.execute_script("window.confirm = function(){return true;}")

        # Click delete
        self.click("button:contains('Delete account')")

        # Wait for redirect to login page (sign in button appears)
        self.wait_for_element("button:contains('Sign in')", timeout=10)
