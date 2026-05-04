require "rails_helper"

RSpec.describe "Notes", type: :request do
  let(:user) { create(:user) }
  let(:token) do
    post "/users/sign_in",
      params: { user: { email: user.email, password: "password123" } },
      as: :json
    response.parsed_body["token"]
  end
  let(:auth_headers) { { "Authorization" => "Bearer #{token}" } }

  describe "GET /notes" do
    it "requires authentication" do
      get "/notes", as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns empty list when user has no notes" do
      get "/notes", headers: auth_headers, as: :json

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body["notes"]).to eq([])
      expect(body["pagination"]["count"]).to eq(0)
    end

    it "returns only the current user's notes" do
      other_user = create(:user)
      create(:note, user: other_user, title: "Other user's note")
      create(:note, user: user, title: "My note")

      get "/notes", headers: auth_headers, as: :json

      titles = response.parsed_body["notes"].map { |n| n["title"] }
      expect(titles).to eq([ "My note" ])
    end

    it "returns notes in descending order of creation" do
      create(:note, user: user, title: "Old", created_at: 2.days.ago)
      create(:note, user: user, title: "New", created_at: 1.day.ago)

      get "/notes", headers: auth_headers, as: :json

      titles = response.parsed_body["notes"].map { |n| n["title"] }
      expect(titles).to eq([ "New", "Old" ])
    end

    it "includes pagination metadata" do
      create_list(:note, 3, user: user)

      get "/notes", headers: auth_headers, as: :json

      pagination = response.parsed_body["pagination"]
      expect(pagination["page"]).to eq(1)
      expect(pagination["count"]).to eq(3)
    end

    it "paginates results with limit of 5" do
      create_list(:note, 7, user: user)

      get "/notes", headers: auth_headers, as: :json

      body = response.parsed_body
      expect(body["notes"].size).to eq(5)
      expect(body["pagination"]["pages"]).to eq(2)
      expect(body["pagination"]["next"]).to eq(2)
    end

    it "returns the requested page" do
      create_list(:note, 7, user: user)

      get "/notes", params: { page: 2 }, headers: auth_headers

      body = response.parsed_body
      expect(body["notes"].size).to eq(2)
      expect(body["pagination"]["page"]).to eq(2)
      expect(body["pagination"]["prev"]).to eq(1)
    end
  end

  describe "DELETE /notes/:id" do
    it "requires authentication" do
      note = create(:note, user: user)
      delete "/notes/#{note.id}", as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "deletes the note and returns 204" do
      note = create(:note, user: user)
      expect {
        delete "/notes/#{note.id}", headers: auth_headers, as: :json
      }.to change(Note, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 when note belongs to another user" do
      other_note = create(:note, user: create(:user))
      delete "/notes/#{other_note.id}", headers: auth_headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /notes" do
    it "requires authentication" do
      post "/notes", params: { note: { title: "Test" } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "creates a note with title and content" do
      post "/notes",
        params: { note: { title: "My Note", content: "Some content" } },
        headers: auth_headers,
        as: :json

      expect(response).to have_http_status(:created)
      body = response.parsed_body
      expect(body["title"]).to eq("My Note")
      expect(body["content"]).to eq("Some content")
      expect(body["id"]).to be_present
    end

    it "creates a note without content" do
      post "/notes",
        params: { note: { title: "No Content" } },
        headers: auth_headers,
        as: :json

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["content"]).to be_nil
    end

    it "persists the note in the database" do
      expect {
        post "/notes",
          params: { note: { title: "Persisted" } },
          headers: auth_headers,
          as: :json
      }.to change(Note, :count).by(1)
    end

    it "associates the note with the current user" do
      post "/notes",
        params: { note: { title: "Mine" } },
        headers: auth_headers,
        as: :json

      expect(Note.last.user).to eq(user)
    end

    it "returns 422 when title is blank" do
      post "/notes",
        params: { note: { title: "" } },
        headers: auth_headers,
        as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to be_present
    end

    it "returns 422 when title is missing" do
      post "/notes",
        params: { note: { content: "No title here" } },
        headers: auth_headers,
        as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 422 when title exceeds 200 characters" do
      post "/notes",
        params: { note: { title: "a" * 201 } },
        headers: auth_headers,
        as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"]).to be_present
    end

    it "returns 422 when content exceeds 10_000 characters" do
      post "/notes",
        params: { note: { title: "Valid", content: "a" * 10_001 } },
        headers: auth_headers,
        as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "does not persist an invalid note" do
      expect {
        post "/notes",
          params: { note: { title: "" } },
          headers: auth_headers,
          as: :json
      }.not_to change(Note, :count)
    end
  end
end
