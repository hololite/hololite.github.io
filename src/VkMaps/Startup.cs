using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace App
{
    public class Startup
    {
		/*
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }
		*/

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            //services.AddMvc();
        }


		public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
			/*
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.Run(async (context) =>
            {
                await context.Response.WriteAsync("Hello World!");
            });
            */
            app.UseDefaultFiles();
            //app.UseStaticFiles();
            app.UseStaticFiles(new StaticFileOptions { ServeUnknownFileTypes = true });
        }
    }
}
