module MarketplaceKit
  module Services
    class Config
      def load(endpoint_name)
        @config = {}
        @endpoint = endpoint_name

        load_config_from '.builder'
        load_config_from '.builder-autogenerated', required: false

        raise Errors::MarketplaceError.new 'Error: Invalid env passed!' if @config[@endpoint].nil?
      rescue Errno::ENOENT
        raise Errors::MarketplaceError.new 'Please create .builder file in order to continue.'
      end

      def token
        @config[@endpoint]['token'].to_s
      end

      def set_token(value)
        @config[@endpoint]['token'] = value
        save_token(value)
      end

      def url
        @config[@endpoint]['url'].to_s
      end

      private

      def load_config_from(file_name, options = {})
        return if options[:required] == false && !File.exist?("#{MarketplaceKit.builder_folder}.builder-autogenerated")

        text_config = File.read("#{MarketplaceKit.builder_folder}#{file_name}")
        @config.deeper_merge! JSON.parse(text_config)
      end

      def save_token(value)
        File.write("#{MarketplaceKit.builder_folder}.builder-autogenerated", { @endpoint => { token: value } }.to_json)
      end
    end
  end
end
