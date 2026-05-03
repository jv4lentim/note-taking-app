require "rails_helper"

RSpec.describe User, type: :model do
  it "is valid with valid attributes" do
    expect(build(:user)).to be_valid
  end

  it "is invalid without an email" do
    user = build(:user, email: "")
    expect(user).not_to be_valid
    expect(user.errors[:email]).to include("can't be blank")
  end

  it "is invalid with a duplicate email" do
    create(:user, email: "taken@example.com")
    duplicate = build(:user, email: "taken@example.com")
    expect(duplicate).not_to be_valid
    expect(duplicate.errors[:email]).to include("has already been taken")
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

  it "rotates jti on sign out (revocation)" do
    user = create(:user)
    original_jti = user.jti
    User.revoke_jwt({}, user)
    expect(user.reload.jti).not_to eq(original_jti)
  end
end
