class NotesController < ApplicationController
  include Pagy::Backend
  PAGY_LIMIT = 5

  def index
    pagy, notes = pagy(current_user.notes.ordered, limit: PAGY_LIMIT)
    render json: {
      notes: notes.map { |n| note_json(n) },
      pagination: pagy_metadata(pagy)
    }
  end

  def create
    note = current_user.notes.build(note_params)

    if note.save
      render json: note_json(note), status: :created
    else
      render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def note_params
    params.require(:note).permit(:title, :content)
  end

  def note_json(note)
    { id: note.id, title: note.title, content: note.content, created_at: note.created_at }
  end

  def pagy_metadata(pagy)
    {
      page: pagy.page,
      pages: pagy.pages,
      count: pagy.count,
      next: pagy.next,
      prev: pagy.prev
    }
  end
end
