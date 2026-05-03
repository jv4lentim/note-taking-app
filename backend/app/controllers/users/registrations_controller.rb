module Users
  class RegistrationsController < Devise::RegistrationsController
    respond_to :json
    skip_before_action :authenticate_user!, only: [ :create ]

    private

    def sign_up(resource_name, resource)
      sign_in(resource_name, resource, store: false)
    end

    def respond_with(resource, _opts = {})
      if resource.persisted?
        render json: {
          token: request.env["warden-jwt_auth.token"],
          user: { id: resource.id, email: resource.email }
        }
      else
        render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
end
