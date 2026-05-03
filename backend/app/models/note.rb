class Note < ApplicationRecord
  belongs_to :user

  validates :title, presence: true, length: { maximum: 200 }
  validates :content, length: { maximum: 10_000 }, allow_blank: true

  scope :ordered, -> { order(created_at: :desc) }
end
