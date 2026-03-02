'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Target, Award, Clock } from 'lucide-react'

export default function AcercaDePage() {
  const { language } = useLanguage()

  const values = [
    {
      icon: <Target className="h-6 w-6" />,
      title: language === 'es' ? 'Claridad' : 'Clarity',
      desc: language === 'es' 
        ? 'Comunicamos de forma directa y sin rodeos. Cada propuesta es entendible.' 
        : 'We communicate directly and without detours. Every proposal is understandable.',
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: language === 'es' ? 'Profesionalismo' : 'Professionalism',
      desc: language === 'es' 
        ? 'Trabajamos con estándares altos y cuidamos cada detalle.' 
        : 'We work with high standards and care for every detail.',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: language === 'es' ? 'Puntualidad' : 'Punctuality',
      desc: language === 'es' 
        ? 'Respetamos los tiempos acordados. Sin sorpresas, todo por escrito.' 
        : 'We respect agreed timelines. No surprises, everything in writing.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: language === 'es' ? 'Colaboración' : 'Collaboration',
      desc: language === 'es' 
        ? 'Trabajamos contigo, no solo para ti. Tu visión guía el proyecto.' 
        : 'We work with you, not just for you. Your vision guides the project.',
    },
  ]

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-16 max-w-3xl">
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            {language === 'es' ? 'Sobre ' : 'About '}
            <span className="text-foreground/60">CodeDesignLA</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/70">
            {language === 'es' 
              ? 'Somos un equipo de diseñadores y desarrolladores apasionados por crear soluciones digitales que impulsan negocios. Con más de 5 años de experiencia, hemos ayudado a empresas de toda Latinoamérica a establecer su presencia digital.'
              : 'We are a team of designers and developers passionate about creating digital solutions that drive businesses. With over 5 years of experience, we have helped companies across Latin America establish their digital presence.'
            }
          </p>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <Card className="border-border bg-muted/30">
            <CardContent className="p-8">
              <h2 className="mb-4 text-xl font-bold">
                {language === 'es' ? 'Nuestra misión' : 'Our mission'}
              </h2>
              <p className="text-lg text-foreground/80">
                {language === 'es' 
                  ? 'Transformar ideas en experiencias digitales memorables que conecten con tu audiencia y conviertan visitas en clientes.'
                  : 'Transform ideas into memorable digital experiences that connect with your audience and convert visits into clients.'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">
            {language === 'es' ? 'Nuestros valores' : 'Our values'}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-6">
                  <div className="mb-4 text-foreground/70">{value.icon}</div>
                  <h3 className="mb-2 font-semibold">{value.title}</h3>
                  <p className="text-sm text-foreground/70">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">
            {language === 'es' ? '¿Listo para trabajar juntos?' : 'Ready to work together?'}
          </h2>
          <p className="mb-6 text-foreground/70">
            {language === 'es' 
              ? 'Cuéntanos sobre tu proyecto y te responderemos con una propuesta clara.'
              : 'Tell us about your project and we will respond with a clear proposal.'
            }
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/contacto">{language === 'es' ? 'Contactar' : 'Contact'}</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/proyectos">{language === 'es' ? 'Ver proyectos' : 'View projects'}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
