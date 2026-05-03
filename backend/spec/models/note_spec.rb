require "rails_helper"

RSpec.describe Note, type: :model do
  subject(:note) { build(:note) }

  it "is valid with title and content" do
    expect(note).to be_valid
  end

  it "is valid without content" do
    note.content = nil
    expect(note).to be_valid
  end

  describe "title" do
    it "is invalid when blank" do
      note.title = ""
      expect(note).not_to be_valid
      expect(note.errors[:title]).to be_present
    end

    it "is invalid when nil" do
      note.title = nil
      expect(note).not_to be_valid
    end

    it "is invalid when longer than 200 characters" do
      note.title = "a" * 201
      expect(note).not_to be_valid
      expect(note.errors[:title]).to be_present
    end

    it "is valid at exactly 200 characters" do
      note.title = "a" * 200
      expect(note).to be_valid
    end
  end

  describe "content" do
    it "is invalid when longer than 10_000 characters" do
      note.content = "a" * 10_001
      expect(note).not_to be_valid
      expect(note.errors[:content]).to be_present
    end

    it "is valid at exactly 10_000 characters" do
      note.content = "a" * 10_000
      expect(note).to be_valid
    end
  end

  describe ".ordered" do
    it "returns notes in descending order of creation" do
      user = create(:user)
      old_note = create(:note, user: user, created_at: 2.days.ago)
      new_note = create(:note, user: user, created_at: 1.day.ago)

      expect(user.notes.ordered).to eq([ new_note, old_note ])
    end
  end
end
