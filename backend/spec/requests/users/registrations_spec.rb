require "rails_helper"

RSpec.describe "Users::Registrations", type: :request do
  describe "POST /users" do
    it "creates user and returns token with valid params" do
      post "/users",
        params: { user: { email: "new@example.com", password: "password123", password_confirmation: "password123" } },
        as: :json

      expect(response).to have_http_status(:success)
      body = response.parsed_body
      expect(body["token"]).to be_present
      expect(body["user"]["email"]).to eq("new@example.com")
      expect(User.exists?(email: "new@example.com")).to be true
    end

    it "returns 422 with duplicate email" do
      create(:user, email: "existing@example.com")

      post "/users",
        params: { user: { email: "existing@example.com", password: "password123", password_confirmation: "password123" } },
        as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to be_present
    end

    it "returns 422 with password too short" do
      post "/users",
        params: { user: { email: "new@example.com", password: "short", password_confirmation: "short" } },
        as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to be_present
    end

    it "returns 422 with mismatched passwords" do
      post "/users",
        params: { user: { email: "new@example.com", password: "password123", password_confirmation: "different" } },
        as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 422 with missing email" do
      post "/users",
        params: { user: { password: "password123", password_confirmation: "password123" } },
        as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
