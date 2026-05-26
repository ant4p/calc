from django.views.generic import TemplateView


class ShowIndex(TemplateView):
    template_name = "src/index.html"
