require "rails_helper"

RSpec.describe User, type: :model do
  it "is valid with valid attributes" do
    expect(build(:user)).to be_valid
  end

  it "is invalid without an email" do
    user = build(:user, email: "")
    expect(user).not_to be_valid
    expect(user.errors[:email]).to include("não pode ficar em branco")
  end

  it "is invalid with a duplicate email" do
    create(:user, email: "taken@example.com")
    duplicate = build(:user, email: "taken@example.com")
    expect(duplicate).not_to be_valid
    expect(duplicate.errors[:email]).to include("já está em uso")
  end

  it "is invalid without a password" do
    user = build(:user, password: "", password_confirmation: "")
    expect(user).not_to be_valid
  end

  it "is invalid with a password shorter than the minimum length" do
    user = build(:user, password: "short", password_confirmation: "short")
    expect(user).not_to be_valid
  end

  it "sets jti on create" do
    user = create(:user)
    expect(user.jti).to be_present
  end
end
