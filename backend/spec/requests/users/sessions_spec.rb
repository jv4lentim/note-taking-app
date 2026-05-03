require "rails_helper"

RSpec.describe "Users::Sessions", type: :request do
  let(:user) { create(:user, email: "user@example.com", password: "password123") }

  describe "POST /users/sign_in" do
    it "returns token and user with valid credentials" do
      post "/users/sign_in",
        params: { user: { email: user.email, password: "password123" } },
        as: :json

      expect(response).to have_http_status(:success)
      body = response.parsed_body
      expect(body["token"]).to be_present
      expect(body["user"]["email"]).to eq(user.email)
      expect(body["user"]["id"]).to eq(user.id)
    end

    it "returns 401 with wrong password" do
      post "/users/sign_in",
        params: { user: { email: user.email, password: "wrongpassword" } },
        as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 401 with unknown email" do
      post "/users/sign_in",
        params: { user: { email: "nobody@example.com", password: "password123" } },
        as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /users/sign_out" do
    let(:token) do
      post "/users/sign_in",
        params: { user: { email: user.email, password: "password123" } },
        as: :json
      response.parsed_body["token"]
    end

    it "returns success message with valid token" do
      delete "/users/sign_out", headers: { "Authorization" => "Bearer #{token}" }

      expect(response).to have_http_status(:success)
      expect(response.parsed_body["message"]).to eq("Signed out successfully.")
    end

    it "returns 401 when reusing a revoked token" do
      delete "/users/sign_out", headers: { "Authorization" => "Bearer #{token}" }
      delete "/users/sign_out", headers: { "Authorization" => "Bearer #{token}" }

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 401 without a token" do
      delete "/users/sign_out"

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
