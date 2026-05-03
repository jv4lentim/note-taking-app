class ApplicationController < ActionController::API
  before_action :authenticate_user!

  rescue_from JWT::DecodeError, JWT::ExpiredSignature, with: :unauthorized_response

  private

  def unauthorized_response
    render json: { error: "Unauthorized" }, status: :unauthorized
  end
end
