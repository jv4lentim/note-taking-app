FactoryBot.define do
  factory :note do
    sequence(:title) { |n| "Note #{n}" }
    content { "Some content" }
    association :user
  end
end
