module Users
  class SessionsController < Devise::SessionsController
    respond_to :json
    skip_before_action :authenticate_user!, only: [ :create ]

    private

    def verify_signed_out_user
      return if warden.authenticate(scope: resource_name)
      respond_to_on_destroy(non_navigational_status: :unauthorized)
    end

    def respond_with(resource, _opts = {})
      render json: {
        token: request.env["warden-jwt_auth.token"],
        user: { id: resource.id, email: resource.email }
      }
    end

    def respond_to_on_destroy(non_navigational_status: :no_content, **)
      if non_navigational_status == :unauthorized
        render json: { error: "Unauthorized" }, status: :unauthorized
      else
        render json: { message: "Signed out successfully." }
      end
    end
  end
end
