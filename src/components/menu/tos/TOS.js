import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/content/clear'
import IconBack from 'material-ui/svg-icons/navigation/arrow-back'
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar'
import { Tab, Tabs } from 'material-ui/Tabs'
import { Restricted, translate } from 'admin-on-rest'
import { themes } from '../../../properties'

const styles = {
  label: { width: '10em', display: 'inline-block', color: 'rgba(255, 255, 255, 0.7)' },
  button: { margin: '1em' },
  card: {
    boxShadow: 'none',
    minWidth: 300,
    backgroundColor: 'transparent'
  },
  toolbar: {
    background: 'transparent',
    boxShadow: 'none',
  }
}

class TOS extends PureComponent {
  componentDidMount = () => {
    this.setState({ hiddenElement: false })
  }
  componentWillUnmount = () => {
    this.setState({ hiddenElement: true })
  }
  handleClose = () => {
    this.props.history.push('/')
  }
  handleChange = (val) => {
    this.setState({ tabForm: val })
  }
  handleChangeColor = (val) => {
    this.setState({ tabColor: val })
  }

  constructor (props) {
    super(props)
    this.state = {
      tabForm: false,
      tabColor: 'english',
      hiddenElement: true
    }
  }

  render () {
    const { theme, activeSection, history } = this.props
    const { tabForm, tabColor } = this.state

    return (
      <Dialog bodyStyle={{ overflow: 'auto', backgroundImage: themes[theme].gradientColors[0] }} open
        contentClassName={(this.state.hiddenElement) ? '' : 'classReveal'}
        contentStyle={{ transform: '', transition: 'opacity 1s', opacity: 0 }} onRequestClose={this.handleClose}>
        <Card activeSection={activeSection} style={styles.card}>
          <div style={{ float: 'right' }}>
            <Toolbar style={styles.toolbar}>
              <ToolbarGroup>
                <ToolbarTitle text={''} />
              </ToolbarGroup>
              <ToolbarGroup>
                <IconButton
                  tooltipPosition='bottom-left'
                  tooltip={'Go Back'} touch key={'back'} onClick={() => {
                    history.goBack()
                  }}>
                  <IconBack hoverColor={themes[theme].highlightColors[0]} />
                </IconButton>
                <IconButton
                  tooltipPosition='bottom-left'
                  tooltip={'Close'} touch key={'close'} containerElement={<Link to='/' />}>
                  <CloseIcon hoverColor={themes[theme].highlightColors[0]} />
                </IconButton>
              </ToolbarGroup>
            </Toolbar>
          </div>
          <div>
            <Tabs
              inkBarContainerStyle={{ width: 'calc(100% - 270px)' }}
              tabItemContainerStyle={{ width: 'calc(100% - 270px)' }}
              inkBarStyle={{
                backgroundColor: themes[theme].highlightColors[0]
              }}
              value={tabForm || activeSection}
              onChange={this.handleChange}
            >
              <Tab label='Terms of Service' value='tos' style={{ overflow: 'auto' }}>
                <div>
                  <div><br /></div>
                  <div><span style={{ whiteSpace: 'pre-wrap' }} /></div>
                  <div>
                    <h3>ChronasOrg Terms of Service</h3></div>
                  <div><br /></div>
                  <div>1. Terms</div>
                  <div><br /></div>
                  <div>&nbsp; By accessing the website at <a href='https://www.chronas.org' target='_blank'
                    data-saferedirecturl='https://www.google.com/url?q=https://www.chronas.org&amp;source=gmail&amp;ust=1544761682344000&amp;usg=AFQjCNEloH0qDGN6RWpjqTuyApoBvWJH_w'>https://www.chronas.org</a>,
                    you are agreeing to be bound by these terms of service, all applicable laws and regulations, and
                    agree that you are responsible for compliance with any applicable local laws. If you do not agree
                    with any of these terms, you are prohibited from using or accessing this site. The materials
                    contained in this website are protected by applicable copyright and trademark law.
                  </div>
                  <div><br /></div>
                  <div>2. Use License</div>
                  <div><br /></div>
                  <div>&nbsp;&nbsp;</div>
                  <div>&nbsp; &nbsp;&nbsp;</div>
                  <div>&nbsp; &nbsp; &nbsp; Permission is granted to temporarily download one copy of the materials
                    (information or software) on ChronasOrg's website for personal, non-commercial transitory viewing
                    only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </div>
                  <div><br /></div>
                  <div>&nbsp; &nbsp; &nbsp;&nbsp;</div>
                  <div>&nbsp; &nbsp; &nbsp; &nbsp; modify or copy the materials;</div>
                  <div>&nbsp; &nbsp; &nbsp; &nbsp; use the materials for any commercial purpose, or for any public
                    display (commercial or non-commercial);
                  </div>
                  <div>&nbsp; &nbsp; &nbsp; &nbsp; attempt to decompile or reverse engineer any software contained on
                    ChronasOrg's website;
                  </div>
                  <div>&nbsp; &nbsp; &nbsp; &nbsp; remove any copyright or other proprietary notations from the
                    materials; or
                  </div>
                  <div>&nbsp; &nbsp; &nbsp; &nbsp; transfer the materials to another person or "mirror" the materials on
                    any other server.
                  </div>
                  <div>&nbsp; &nbsp; &nbsp;&nbsp;</div>
                  <div>&nbsp; &nbsp;&nbsp;</div>
                  <div>&nbsp; &nbsp; This license shall automatically terminate if you violate any of these restrictions
                    and may be terminated by ChronasOrg at any time. Upon terminating your viewing of these materials or
                    upon the termination of this license, you must destroy any downloaded materials in your possession
                    whether in electronic or printed format.
                  </div>
                  <div>&nbsp;&nbsp;</div>
                  <div><br /></div>
                  <div>3. Disclaimer</div>
                  <div><br /></div>
                  <div>&nbsp;&nbsp;</div>
                  <div>&nbsp; &nbsp; The materials on ChronasOrg's website are provided on an 'as is' basis. ChronasOrg
                    makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties
                    including, without limitation, implied warranties or conditions of merchantability, fitness for a
                    particular purpose, or non-infringement of intellectual property or other violation of rights.
                  </div>
                  <div>&nbsp; &nbsp; Further, ChronasOrg does not warrant or make any representations concerning the
                    accuracy, likely results, or reliability of the use of the materials on its website or otherwise
                    relating to such materials or on any sites linked to this site.
                  </div>
                  <div>&nbsp;&nbsp;</div>
                  <div><br /></div>
                  <div>4. Limitations</div>
                  <div><br /></div>
                  <div>&nbsp; In no event shall ChronasOrg or its suppliers be liable for any damages (including,
                    without limitation, damages for loss of data or profit, or due to business interruption) arising out
                    of the use or inability to use the materials on ChronasOrg's website, even if ChronasOrg or a
                    ChronasOrg authorized representative has been notified orally or in writing of the possibility of
                    such damage. Because some jurisdictions do not allow limitations on implied warranties, or
                    limitations of liability for consequential or incidental damages, these limitations may not apply to
                    you.
                  </div>
                  <div><br /></div>
                  <div>5. Accuracy of materials</div>
                  <div><br /></div>
                  <div>&nbsp; The materials appearing on ChronasOrg's website could include technical, typographical, or
                    photographic errors. ChronasOrg does not warrant that any of the materials on its website are
                    accurate, complete or current. ChronasOrg may make changes to the materials contained on its website
                    at any time without notice. However ChronasOrg does not make any commitment to update the materials.
                  </div>
                  <div><br /></div>
                  <div>6. History Data</div>
                  <div><br /></div>
                  <div>&nbsp; ChronasOrg has not reviewed all of the user contributed articles and media linked and is
                    not responsible for the contents of any such linked data. The inclusion of any link does not imply
                    endorsement by ChronasOrg of the site. Use of any such linked items is at the user's own risk.
                  </div>
                  <div><br /></div>
                  <div>7. Modifications</div>
                  <div><br /></div>
                  <div>&nbsp; ChronasOrg may revise these terms of service for its website at any time without notice.
                    By using this website you are agreeing to be bound by the then current version of these terms of
                    service.
                  </div>
                  <div><br /></div>
                  <div>8. Governing Law</div>
                  <div><br /></div>
                  <div>&nbsp; These terms and conditions are governed by and construed in accordance with the laws of
                    Wisconsin and you irrevocably submit to the exclusive jurisdiction of the courts in that State or
                    location.
                  </div>
                  <div><span style={{ whiteSpace: 'pre-wrap' }} /></div>
                </div>
              </Tab>
              <Tab label='Privacy' value='privacy' style={{ overflow: 'auto' }}>
                <Tabs
                  inkBarContainerStyle={{ width: '100%' }}
                  tabItemContainerStyle={{ width: '100%' }}
                  inkBarStyle={{
                    backgroundColor: themes[theme].highlightColors[0]
                  }}
                  value={tabColor}
                  onChange={this.handleChangeColor}
                >
                  <Tab label='English' value='english' style={{ overflow: 'auto' }}>
                    <div role='tabpanel' className='tab-pane  active ' id='english'>
                      <br />
                      <h3>Privacy Policy</h3>

                      <p>Effective date: December 12, 2018</p>

                      <p>ChronasOrg ("us", "we", or "our") operates the https://chronas.org website (the "Service").</p>

                      <p>This page informs you of our policies regarding the collection, use, and disclosure of personal
                        data when you use our Service and the choices you have associated with that data. Our Privacy
                        Policy for ChronasOrg is based on the <a
                          href='https://www.freeprivacypolicy.com/blog/sample-privacy-policy-template/'>Free Privacy
                          Policy Template Website</a>.</p>

                      <p>We use your data to provide and improve the Service. By using the Service, you agree to the
                        collection and use of information in accordance with this policy. Unless otherwise defined in
                        this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms
                        and Conditions, accessible from https://chronas.org</p>

                      <h3>Information Collection And Use</h3>

                      <p>We collect several different types of information for various purposes to provide and improve
                        our Service to you.</p>

                      <h3>Types of Data Collected</h3>

                      <h4>Personal Data</h4>

                      <p>While using our Service, we may ask you to provide us with certain personally identifiable
                        information that can be used to contact or identify you ("Personal Data"). Personally
                        identifiable information may include, but is not limited to:</p>

                      <ul>
                        <li>Email address</li>
                        <li>First name and last name</li>
                        <li>Cookies and Usage Data</li>
                      </ul>

                      <h4>Usage Data</h4>

                      <p>We may also collect information how the Service is accessed and used ("Usage Data"). This Usage
                        Data may include information such as your computer's Internet Protocol address (e.g. IP
                        address), browser type, browser version, the pages of our Service that you visit, the time and
                        date of your visit, the time spent on those pages, unique device identifiers and other
                        diagnostic data.</p>

                      <h4>Tracking &amp; Cookies Data</h4>
                      <p>We use cookies and similar tracking technologies to track the activity on our Service and hold
                        certain information.</p>
                      <p>Cookies are files with small amount of data which may include an anonymous unique identifier.
                        Cookies are sent to your browser from a website and stored on your device. Tracking technologies
                        also used are beacons, tags, and scripts to collect and track information and to improve and
                        analyze our Service.</p>
                      <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                        However, if you do not accept cookies, you may not be able to use some portions of our
                        Service.</p>
                      <p>Examples of Cookies we use:</p>
                      <ul>
                        <li><strong>Session Cookies.</strong> We use Session Cookies to operate our Service.</li>
                        <li><strong>Preference Cookies.</strong> We use Preference Cookies to remember your preferences
                          and various settings.
                        </li>
                        <li><strong>Security Cookies.</strong> We use Security Cookies for security purposes.</li>
                      </ul>

                      <h3>Use of Data</h3>

                      <p>ChronasOrg uses the collected data for various purposes:</p>
                      <ul>
                        <li>To provide and maintain the Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To allow you to participate in interactive features of our Service when you choose to do
                          so
                        </li>
                        <li>To provide customer care and support</li>
                        <li>To provide analysis or valuable information so that we can improve the Service</li>
                        <li>To monitor the usage of the Service</li>
                        <li>To detect, prevent and address technical issues</li>
                      </ul>

                      <h3>Transfer Of Data</h3>
                      <p>Your information, including Personal Data, may be transferred to — and maintained on —
                        computers located outside of your state, province, country or other governmental jurisdiction
                        where the data protection laws may differ than those from your jurisdiction.</p>
                      <p>If you are located outside United States and choose to provide information to us, please note
                        that we transfer the data, including Personal Data, to United States and process it there.</p>
                      <p>Your consent to this Privacy Policy followed by your submission of such information represents
                        your agreement to that transfer.</p>
                      <p>ChronasOrg will take all steps reasonably necessary to ensure that your data is treated
                        securely and in accordance with this Privacy Policy and no transfer of your Personal Data will
                        take place to an organization or a country unless there are adequate controls in place including
                        the security of your data and other personal information.</p>

                      <h3>Disclosure Of Data</h3>

                      <h3>Legal Requirements</h3>
                      <p>ChronasOrg may disclose your Personal Data in the good faith belief that such action is
                        necessary to:</p>
                      <ul>
                        <li>To comply with a legal obligation</li>
                        <li>To protect and defend the rights or property of ChronasOrg</li>
                        <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
                        <li>To protect the personal safety of users of the Service or the public</li>
                        <li>To protect against legal liability</li>
                      </ul>

                      <h3>Security Of Data</h3>
                      <p>The security of your data is important to us, but remember that no method of transmission over
                        the Internet, or method of electronic storage is 100% secure. While we strive to use
                        commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute
                        security.</p>

                      <h3>Service Providers</h3>
                      <p>We may employ third party companies and individuals to facilitate our Service ("Service
                        Providers"), to provide the Service on our behalf, to perform Service-related services or to
                        assist us in analyzing how our Service is used.</p>
                      <p>These third parties have access to your Personal Data only to perform these tasks on our behalf
                        and are obligated not to disclose or use it for any other purpose.</p>
<h3>Google Ads</h3>
<p>We may also show adverts provided by Google. Read more about Google Adsense here: https://support.google.com/adsense/answer/7549925?hl=en</p>
                      <h3>Analytics</h3>
                      <p>We may use third-party Service Providers to monitor and analyze the use of our Service.</p>
                      <ul>
                        <li>
                          <p><strong>Google Analytics</strong></p>
                          <p>Google Analytics is a web analytics service offered by Google that tracks and reports
                            website traffic. Google uses the data collected to track and monitor the use of our Service.
                            This data is shared with other Google services. Google may use the collected data to
                            contextualize and personalize the ads of its own advertising network.</p>
                          <p>You can opt-out of having made your activity on the Service available to Google Analytics
                            by installing the Google Analytics opt-out browser add-on. The add-on prevents the Google
                            Analytics JavaScript (ga.js, analytics.js, and dc.js) from sharing information with Google
                            Analytics about visits activity.</p><p>For more information on the privacy practices of
                          Google, please visit the Google Privacy &amp; Terms web page: <a
                            href='https://policies.google.com/privacy?hl=en'>https://policies.google.com/privacy?hl=en</a>
                            </p>
                        </li>
                      </ul>

                      <h3>Links To Other Sites</h3>
                      <p>Our Service may contain links to other sites that are not operated by us. If you click on a
                        third party link, you will be directed to that third party's site. We strongly advise you to
                        review the Privacy Policy of every site you visit.</p>
                      <p>We have no control over and assume no responsibility for the content, privacy policies or
                        practices of any third party sites or services.</p>

                      <h3>Children's Privacy</h3>
                      <p>Our Service does not address anyone under the age of 18 ("Children").</p>
                      <p>We do not knowingly collect personally identifiable information from anyone under the age of
                        18. If you are a parent or guardian and you are aware that your Children has provided us with
                        Personal Data, please contact us. If we become aware that we have collected Personal Data from
                        children without verification of parental consent, we take steps to remove that information from
                        our servers.</p>

                      <h3>Changes To This Privacy Policy</h3>
                      <p>We may update our Privacy Policy from time to time. We will notify you of any changes by
                        posting the new Privacy Policy on this page.</p>
                      <p>We will let you know via email and/or a prominent notice on our Service, prior to the change
                        becoming effective and update the "effective date" at the top of this Privacy Policy.</p>
                      <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this
                        Privacy Policy are effective when they are posted on this page.</p>

                      <h3>Contact Us</h3>
                      <p>If you have any questions about this Privacy Policy, please contact us:</p>
                      <ul>
                        <li>By email: dietmar.aumann@gmail.com</li>
                        <li>By visiting this page on our website: https://chronas.org/#/info (Contact section)</li>

                      </ul>
                    </div>
                  </Tab>
                  <Tab label='Spanish' value='spanish' style={{ overflow: 'auto' }}>
                    <div role='tabpanel' className='tab-pane ' id='spanish'>
                      <br />
                      <h3>Política de privacidad</h3>

                      <p>Fecha efectiva: December 12, 2018</p>

                      <p>ChronasOrg ("nosotros", "a nosotros", "nuestro") opera el sitio web https://chronas.org (en
                        adelante, el "Servicio").</p>

                      <p>Esta página le informa de nuestras políticas en materia de recopilación, uso y divulgación de
                        datos personales cuando utiliza nuestro Servicio y de las opciones de las que dispone en
                        relación con esos datos. <a
                          href='https://www.freeprivacypolicy.com/blog/sample-privacy-policy-template/'>Plantilla de
                          política de privacidad via FreePrivacyPolicy</a>.</p>

                      <p>Utilizamos sus datos para prestarle el Servicio y mejorarlo. Al utilizar el Servicio, usted
                        acepta la recopilación y el uso de información de conformidad con esta política. A menos que
                        esta Política de privacidad defina lo contrario, los términos utilizados en ella tienen los
                        mismos significados que nuestros Términos y Condiciones, disponibles en el
                        https://chronas.org</p>

                      <h3>Definiciones</h3>
                      <ul>
                        <li>
                          <p><strong>Servicio</strong></p>
                          <p>Servicio es el sitio web https://chronas.org operado por ChronasOrg</p>
                        </li>
                        <li>
                          <p><strong>Datos personales</strong></p>
                          <p>Datos personales significa los datos sobre una persona física viva que puede ser
                            identificada a partir de esos datos (o con esos datos y otra información de la que
                            dispongamos o probablemente podamos disponer).</p>
                        </li>
                        <li>
                          <p><strong>Datos de uso</strong></p>
                          <p>Datos de uso son los datos recopilados automáticamente, generados por el uso del Servicio o
                            por la propia infraestructura del Servicio (por ejemplo, la duración de la visita a una
                            página).</p>
                        </li>
                        <li>
                          <p><strong>Cookies</strong></p>
                          <p>Las cookies son pequeños archivos ialmacenados en su dispositivo (ordenador o dispositivo
                            móvil).</p>
                        </li>
                      </ul>

                      <h3>Recopilación y uso de la información</h3>
                      <p>Recopilamos diferentes tipos de información con diversas finalidades para prestarle el
                        Servicio y mejorarlo.</p>

                      <h3>Tipos de datos recopilados</h3>

                      <h4>Datos personales</h4>
                      <p>Cuando utilice nuestro Servicio, es posible que le pidamos que nos proporcione determinada
                        información personalmente identificable que podrá ser utilizada para contactar con usted o para
                        identificarle ("Datos personales"). La información personalmente identificable puede incluir,
                        entre otras, la siguiente:</p>

                      <ul>
                        <li>Dirección de e-mail</li>
                        <li>Nombre y apellidos</li>
                        <li>Cookies y datos de uso</li>
                      </ul>

                      <h4>Datos de uso</h4>

                      <p>También recopilamos información sobre la forma en la que se accede y utiliza el Servicio
                        («Datos de uso»). Estos Datos de uso pueden incluir información como la dirección del protocolo
                        de Internet de su ordenador (por ejemplo, dirección IP), tipo de navegador, versión del
                        navegador, las páginas que visita de nuestro Servicio, la hora y la fecha de su visita, el
                        tiempo que pasa en esas páginas, identificadores exclusivos de dispositivos y otros datos de
                        diagnóstico.</p>

                      <h4>Datos de cookies y seguimiento</h4>
                      <p>Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad de nuestro
                        Servicio y mantener determinada información.</p>
                      <p>Las cookies son archivos con una pequeña cantidad de datos que pueden incluir un identificador
                        exclusivo anónimo. Las cookies son enviadas a su navegador desde un sitio web y se almacenan en
                        su dispositivo. Otras tecnologías de seguimiento también utilizadas son balizas, etiquetas y
                        scripts para recopilar y rastrear la información, así como para mejorar y analizar nuestro
                        Servicio.</p>
                      <p>Usted puede ordenar a su navegador que rechace todas las cookies o que le avise cuando se envía
                        una cookie. Sin embargo, si no acepta cookies, es posible que no pueda utilizar algunas partes
                        de nuestro Servicio.</p>
                      <p>Ejemplos de Cookies que utilizamos:</p>
                      <ul>
                        <li><strong>Cookies de sesión.</strong> Utilizamos Cookies de sesión para operar nuestro
                          Servicio.
                        </li>
                        <li><strong>Cookies de preferencia.</strong> Utilizamos Cookies de preferencia para recordar sus
                          preferencias y diversos ajustes.
                        </li>
                        <li><strong>Cookies de seguridad.</strong> Utilizamos Cookies de seguridad para fines de
                          seguridad.
                        </li>
                      </ul>

                      <h3>Uso de datos</h3>
                      <p>ChronasOrg utiliza los datos recopilados con diversas finalidades:</p>
                      <ul>
                        <li>Suministrar y mantener nuestro Servicio</li>
                        <li>Notificarle cambios en nuestro Servicio</li>
                        <li>Permitirle participar en funciones interactivas de nuestro Servicio cuando decida hacerlo
                        </li>
                        <li>Prestar asistencia al cliente</li>
                        <li>Recopilar análisis o información valiosa que nos permitan mejorar nuestro Servicio</li>
                        <li>Controlar el uso de nuestro Servicio</li>
                        <li>Detectar, evitar y abordar problemas técnicos</li>
                      </ul>

                      <h3>Transferencia de datos</h3>
                      <p>Su información, incluyendo Datos personales, puede ser transferida a —y mantenida en—
                        ordenadores localizados fuera de su estado, provincia, país u otra jurisdicción gubernamental
                        donde las leyes de protección de datos pueden diferir de las de su jurisdicción.</p>
                      <p>Si usted se encuentra fuera de United States y decide facilitarnos información, tenga en cuenta
                        que nosotros transferimos los datos, incluyendo Datos personales, a United States y que los
                        tratamos allí.</p>
                      <p>Su aceptación de esta Política de privacidad seguida de su envío de esta información representa
                        que está de acuerdo con dicha transferencia.</p>
                      <p>ChronasOrg emprenderá todas las medidas razonables necesarias para garantizar que sus datos
                        sean tratados de forma segura y de conformidad con esta Política de privacidad y no se realizará
                        ninguna transferencia de sus Datos personales a una organización o país, salvo que existan unos
                        controles adecuados establecidos incluyendo la seguridad de sus datos y otra información
                        personal.</p>

                      <h3>Divulgación de datos</h3>

                      <h3>Requisitos legales</h3>
                      <p>ChronasOrg puede divulgar sus Datos personales de buena fe cuando considere que esta acción es
                        necesaria para lo siguiente:</p>
                      <ul>
                        <li>Cumplir una obligación legal</li>
                        <li>Proteger y defender los derechos o bienes de ChronasOrg</li>
                        <li>Prevenir o investigar posibles infracciones en relación con el Servicio</li>
                        <li>Proteger la seguridad personal de usuarios del Servicio o del público</li>
                        <li>Protegerse frente a consecuencias legales</li>
                      </ul>

                      <h3>Seguridad de los datos</h3>
                      <p>La seguridad de sus datos es importante para nosotros, pero recuerde que ningún método de
                        transmisión por Internet o método de almacenamiento electrónico resulta 100% seguro. A pesar de
                        que nos esforzamos por utilizar medios comercialmente aceptables para proteger sus Datos
                        personales, no podemos garantizar su seguridad absoluta.</p>

                      <h3>Proveedores de servicios</h3>
                      <p>Podemos contratar a personas físicas y jurídicas terceras para facilitar nuestro Servicio
                        ("Proveedores de servicios"), para que presten el Servicio en nuestro nombre, para que
                        suministren servicios relacionados con el Servicio o para que nos ayuden a analizar cómo se
                        utiliza nuestro Servicio.</p>
                      <p>Estos terceros tienen acceso a sus Datos personales únicamente para realizar estas tareas en
                        nuestro nombre y están obligados a no divulgarlos ni utilizarlos con ningún otro fin.</p>

                      <h3>Análisis</h3>
                      <p>Podemos utilizar Proveedores de servicios terceros para controlar y analizar el uso de nuestro
                        Servicio.</p>
                      <ul>
                        <li>
                          <p><strong>Google Analytics</strong></p>
                          <p>Google Analytics es un servicio de analítica web ofrecido por Google que rastrea e informa
                            del tráfico de los sitios web. Google utiliza los datos recopilados para rastrear y
                            controlar el uso de nuestro Servicio. Estos datos son compartidos con otros servicios de
                            Google. Google puede utilizar los datos recopilados para contextualizar y personalizar los
                            anuncios de su propia red de publicidad.</p>
                          <p>Puede optar por que su actividad en el Servicio no esté disponible para Google Analytics
                            instalando el complemento de inhabilitación para el navegador. Este complemento evita que el
                            JavaScript de Google Analytics (ga.js, analytics.js y dc.js) comparta información con Google
                            Analytics sobre la actividad de las visitas.</p><p>Para más información sobre las prácticas
                          de privacidad de Google, visite la página web de Privacidad y Condiciones de Google: <a
                            href='https://policies.google.com/privacy?hl=en'>https://policies.google.com/privacy?hl=en</a>
                            </p>
                        </li>
                      </ul>

                      <h3>Enlaces a otros sitios</h3>
                      <p>Nuestro Servicio puede contener enlaces a otros sitios no operados por nosotros. Si hace clic
                        en el enlace de un tercero, será dirigido al sitio de ese tercero. Le recomendamos
                        encarecidamente que revise la Política de privacidad de todos los sitios que visite.</p>
                      <p>No tenemos ningún control ni asumimos responsabilidad alguna con respecto al contenido, las
                        políticas o prácticas de privacidad de sitios o servicios de terceros.</p>

                      <h3>Privacidad del menor</h3>
                      <p>Nuestro servicio no está dirigido a ningún menor de 18 años (en adelante, "Menor").</p>
                      <p>No recopilamos de forma consciente información personalmente identificable de menores de 18
                        años. Si es usted un padre/madre o tutor y tiene conocimiento de que su hijo nos ha facilitado
                        Datos personales, contacte con nosotros. Si tenemos conocimiento de que hemos recopilado Datos
                        personales de menores sin verificación del consentimiento parental, tomamos medidas para
                        eliminar esa información de nuestros servidores.</p>

                      <h3>Cambios en esta Política de privacidad</h3>
                      <p>Podemos actualizar nuestra Política de privacidad periódicamente. Le notificaremos cualquier
                        cambio publicando la nueva Política de privacidad en esta página.</p>
                      <p>Le informaremos a través del e-mail y/o de un aviso destacado sobre nuestro Servicio antes de
                        que el cambio entre en vigor y actualizaremos la «fecha efectiva» en la parte superior de esta
                        Política de privacidad.</p>
                      <p>Le recomendamos que revise esta Política de privacidad periódicamente para comprobar si se ha
                        introducido algún cambio. Los cambios en esta Política de privacidad entran en vigor cuando se
                        publican en esta página.</p>

                      <h3>Contacte con nosotros</h3>
                      <p>Si tiene alguna pregunta sobre esta Política de privacidad, contacte con nosotros: </p>
                      <ul>
                        <li>Por e-mail: dietmar.aumann@gmail.com</li>
                        <li>Visitando esta página en nuestro sitio web: https://chronas.org/#/info (Contact section)
                        </li>

                      </ul>
                    </div>
                  </Tab>
                  <Tab label='French' value='french' style={{ overflow: 'auto' }}>
                    <div role='tabpanel' className='tab-pane ' id='french'>
                      <br />
                      <h3>Politique de Confidentialité</h3>

                      <p>Date de prise d'effet: December 12, 2018</p>

                      <p>ChronasOrg ("nous", "notre", "nos") exploite le site web https://chronas.org (ci-après désigné
                        par le terme "Service").</p>

                      <p>Cette page vous explique nos politiques en matière de collecte, d'utilisation et de
                        communication des données à caractère personnel lorsque vous utilisez notre Service ainsi que
                        les choix qui s'offrent à vous en ce qui concerne ces données. <a
                          href='https://www.freeprivacypolicy.com/blog/sample-privacy-policy-template/'>Modèle de
                          politique de confidentialité via FreePrivacyPolicy</a>.</p>

                      <p>Nous utilisons vos données pour fournir et améliorer le Service. En utilisant le Service, vous
                        consentez à la collecte et à l'utilisation d'informations conformément à la présente politique.
                        Sauf définition contraire dans la présente Politique de Confidentialité, les termes utilisés
                        dans la présente Politique de Confidentialité ont la même signification que dans nos Conditions
                        Générales qui sont disponibles sur https://chronas.org</p>

                      <h3>Définitions</h3>
                      <ul>
                        <li>
                          <p><strong>Service</strong></p>
                          <p>Par Service on entend le site web https://chronas.org exploité par ChronasOrg</p>
                        </li>
                        <li>
                          <p><strong>Données à caractère personnel</strong></p>
                          <p>Données à Caractère Personnel désigne des données concernant un individu vivant qui peut
                            être identifié à partir de ces données (ou à partir de ces données et d'autres informations
                            en notre possession ou susceptibles d'entrer en notre possession).</p>
                        </li>
                        <li>
                          <p><strong>Données d'Utilisation</strong></p>
                          <p>Les Données d'Utilisation sont recueillies automatiquement et sont générées soit par
                            l'utilisation du Service, soit par l'infrastructure du Service proprement dite (par exemple,
                            durée de consultation d'une page).</p>
                        </li>
                        <li>
                          <p><strong>Cookies</strong></p>
                          <p>Les cookies sont de petits fichiers enregistrés sur votre dispositif (ordinateur ou
                            dispositif mobile).</p>
                        </li>
                      </ul>

                      <h3>Collecte et utilisation des données</h3>
                      <p>Nous recueillons plusieurs types de données à différentes fins en vue de vous fournir notre
                        Service et de l'améliorer.</p>

                      <h3>Types de données recueillies</h3>

                      <h4>Données à Caractère Personnel</h4>
                      <p>Lorsque vous utilisez notre Service, il est possible que nous vous demandions de nous fournir
                        certaines données personnelles nominatives qui peuvent servir à vous contacter ou à vous
                        identifier ("Données à Caractère Personnel"). Les données personnelles nominatives peuvent
                        comprendre, mais de manière non limitative:</p>

                      <ul>
                        <li>Adresse e-mail</li>
                        <li>Prénom et nom de famille</li>
                        <li>Cookies et Données d'Utilisation</li>
                      </ul>

                      <h4>Données d'Utilisation</h4>

                      <p>Nous pouvons également recueillir des informations relatives au mode d'accès et d'utilisation
                        du Service ("Données d'Utilisation"). Ces Données d'Utilisation peuvent comprendre des
                        informations telles que l'adresse de protocole Internet (c.-à-d. l'adresse IP) de votre
                        ordinateur, le type de navigateur, la version du navigateur, les pages de notre Service que vous
                        consultez, la date et l'heure de votre visite, le temps passé sur ces pages, les identifiants
                        uniques de dispositifs ainsi que d'autres données de diagnostic.</p>

                      <h4>Suivi et données de cookies</h4>
                      <p>Nous avons recours à des cookies et à d'autres technologies de suivi similaires pour effectuer
                        un suivi des activités effectuées dans notre Service, et nous conservons certaines
                        informations.</p>
                      <p>Les cookies sont des fichiers à faible volume de données pouvant comporter un identifiant
                        unique anonyme. Les cookies sont envoyés à votre navigateur depuis un site web et sont stockés
                        sur votre dispositif. D'autres technologies de suivi telles que les pixels, les balises et les
                        scripts sont également utilisées pour recueillir et suivre des informations et afin d'améliorer
                        et d'analyser notre Service.</p>
                      <p>Vous pouvez demander à votre navigateur de refuser tous les cookies ou de vous avertir
                        lorsqu'un cookie est envoyé. Toutefois, si vous n'acceptez pas les cookies, il se peut que vous
                        ne puissiez pas utiliser certains éléments de notre Service.</p>
                      <p>Exemples de cookies que nous utilisons :</p>
                      <ul>
                        <li><strong>Cookies de Session.</strong> Nous utilisons des Cookies de Session pour faire
                          fonctionner notre Service.
                        </li>
                        <li><strong>Cookies de Préférences.</strong> Nous utilisons des Cookies de Préférences pour
                          mémoriser vos préférences et vos différents paramètres.
                        </li>
                        <li><strong>Cookies de Sécurité.</strong> Nous utilisons des Cookies de Sécurité pour des
                          raisons de sécurité.
                        </li>
                      </ul>

                      <h3>Utilisation des données</h3>

                      <p>ChronasOrg utilise les données recueillies à des fins diverses:</p>
                      <ul>
                        <li>Pour fournir et assurer notre Service</li>
                        <li>Pour vous faire part des changements apportés à notre Service</li>
                        <li>Pour vous permettre d'utiliser les fonctions interactives de notre Service quand vous le
                          souhaitez
                        </li>
                        <li>Pour assurer l'assistance client</li>
                        <li>Pour recueillir des données précieuses ou d'analyses qui nous permettront d'améliorer notre
                          Service
                        </li>
                        <li>Pour contrôler l'utilisation de notre Service</li>
                        <li>Pour détecter, prévenir et régler les problèmes techniques</li>
                      </ul>

                      <h3>Transfert des données</h3>
                      <p>Les informations vous concernant, notamment vos Données à Caractère Personnel, peuvent être
                        transférées de votre région, province, pays, ou autre division territoriale vers des ordinateurs
                        – et stockées sur ces derniers – situés à un endroit où la législation relative à la protection
                        des données diffère de celle du territoire où vous résidez.</p>
                      <p>Si vous résidez hors de/du United States et que vous choisissez de nous communiquer des
                        informations, sachez que nous transférons les données, y compris les Données à Caractère
                        Personnel, vers le/la United States et que nous les y traitons.</p>
                      <p>En acceptant la présente Politique de Confidentialité puis en soumettant ces informations, vous
                        consentez à ce transfert.</p>
                      <p>ChronasOrg prendra toutes les mesures raisonnablement nécessaires pour faire en sorte que vos
                        données soient traitées de manière sécurisée et conformément à la présente Politique de
                        Confidentialité et vos Données à Caractère Personnel ne seront transférées vers aucune
                        organisation ni aucun pays à moins que des contrôles adéquats ne soient en place, notamment en
                        ce qui concerne la sécurité de vos données et d'autres données personnelles.</p>

                      <h3>Communication de données</h3>

                      <h3>Exigences légales</h3>
                      <p>ChronasOrg peut communiquer vos Données à Caractère Personnel si elle estime de bonne foi que
                        cela est nécessaire pour:</p>
                      <ul>
                        <li>S'acquitter d'une obligation légale</li>
                        <li>Protéger et défendre les droits ou les biens de ChronasOrg</li>
                        <li>Prévenir d'éventuels actes répréhensibles ou enquêter sur de tels actes dans le cadre du
                          Service
                        </li>
                        <li>Assurer la sécurité personnelle des utilisateurs du Service ou du public</li>
                        <li>Se protéger contre la responsabilité civile</li>
                      </ul>

                      <h3>Sécurité des données</h3>
                      <p>La sécurité de vos données nous tient à cœur. Toutefois, n'oubliez pas qu'aucune méthode de
                        transmission de données par Internet ou méthode de stockage électronique n'est sûre à 100 %.
                        Bien que nous nous efforcions d'utiliser des méthodes commercialement acceptables pour protéger
                        vos Données à Caractère Personnel, nous ne pouvons pas leur garantir une sécurité absolue.</p>

                      <h3>Prestataires de services</h3>
                      <p>Nous pouvons faire appel à des sociétés tierces et à des tierces personnes pour faciliter la
                        prestation de notre Service ("Prestataires de Services"), assurer le Service en notre nom,
                        assurer des services liés au Service ou nous aider à analyser la façon dont notre Service est
                        utilisé.</p>
                      <p>Ces tiers n'ont accès à vos Données à Caractère Personnel que pour effectuer ces tâches en
                        notre nom et il leur est interdit de les communiquer ou de les utiliser à quelle qu'autre
                        fin. </p>

                      <h3>Analyses</h3>
                      <p>Nous pouvons faire appel à des Prestataires de Services tiers pour surveiller et analyser
                        l'utilisation de notre Service.</p>
                      <ul>
                        <li>
                          <p><strong>Google Analytics</strong></p>
                          <p>Google Analytics est un service d'analyse web proposé par Google qui assure le suivi du
                            trafic d'un site web et en rend compte. Google utilise les données recueillies pour suivre
                            et surveiller l'utilisation de notre Service. Ces données sont partagées avec d'autres
                            services Google. Google peut utiliser les données recueillies pour contextualiser et
                            personnaliser les annonces de son propre réseau publicitaire.</p>
                          <p>Vous pouvez empêcher que vos activités dans le cadre du Service ne soient mises à la
                            disposition de Google Analytics en installant le plug-in pour navigateur Analytics Opt out
                            browser add-on de Google Analytics. Ce plug-in empêche le code JavaScript de Google
                            Analytics JavaScript (ga.js, analytics.js et dc.js) de partager les informations concernant
                            les activités liées aux visites avec Google Analytics. </p><p>Pour plus de précisions sur
                          les pratiques de confidentialité de Google, merci de consulter la page web Protection de la
                          vie privée et conditions de Google: <a
                            href='https://policies.google.com/privacy?hl=en'>https://policies.google.com/privacy?hl=en</a>
                            </p>
                        </li>
                      </ul>

                      <h3>Liens pointant vers d'autres sites</h3>
                      <p>Il se peut que notre Service contienne des liens pointant vers d'autres sites que nous
                        n'exploitons pas. Si vous cliquez sur un lien de tiers, vous serez redirigé vers le site de ce
                        tiers. Nous vous recommandons vivement d'examiner la politique de confidentialité de chacun des
                        sites que vous consultez.</p>
                      <p>Nous n'avons aucun contrôle sur le contenu, les politiques ou pratiques de confidentialité des
                        sites ou services de tiers et déclinons toute responsabilité en ce qui les concerne.</p>

                      <h3>Vie privée des enfants</h3>
                      <p>Notre Service ne s'adresse pas aux personnes de moins de 18 ans ("Enfants").</p>
                      <p>Nous ne recueillons pas sciemment de données personnelles nominatives auprès de personnes de
                        moins de 18 ans. Si vous êtes un parent ou un tuteur et que vous savez que votre Enfant nous a
                        communiqué des Données à Caractère Personnel, veuillez nous contacter. Si nous apprenons que
                        nous avons recueilli des Données à Caractère Personnel auprès d'enfants sans vérifier s'il y a
                        consentement parental, nous faisons le nécessaire pour supprimer ces informations de nos
                        serveurs.</p>

                      <h3>Modifications de la présente Politique de Confidentialité</h3>
                      <p>Nous nous réservons le droit d'actualiser notre Politique de Confidentialité de temps à autre.
                        Nous vous informerons de toute modification en publiant la nouvelle Politique de Confidentialité
                        sur cette page.</p>
                      <p>Avant que la modification ne prenne effet, nous vous en informerons par e-mail et/ ou en
                        plaçant un avis bien en vue dans notre Service et nous actualiserons la "date de prise d'effet"
                        qui figure en haut de la présente Politique de Confidentialité.</p>
                      <p>Nous vous conseillons de consulter la présente Politique de Confidentialité périodiquement pour
                        prendre connaissance de toute modification. Les modifications apportées à la présente Politique
                        de Confidentialité prennent effet lorsqu'elles sont publiées sur cette page.</p>

                      <h3>Nous contacter</h3>
                      <p>Pour toute question relative à la présente Politique de Confidentialité, veuillez nous
                        contacter:</p>
                      <ul>
                        <li>Par courrier électronique: dietmar.aumann@gmail.com</li>
                        <li>En consultant cette page sur notre site web: https://chronas.org/#/info (Contact section)
                        </li>

                      </ul>
                    </div>
                  </Tab>
                  <Tab label='German' value='german' style={{ overflow: 'auto' }}>
                    <div role='tabpanel' className='tab-pane ' id='german'>
                      <br />
                      <h3>Datenschutz-Richtlinie</h3>

                      <p>Datum des Inkrafttretens: December 12, 2018</p>

                      <p>ChronasOrg ("wir", "uns", "unser" usw.) betreibt die Website https://chronas.org (nachstehend
                        als "Dienst" bezeichnet).</p>

                      <p>Diese Seite enthält Informationen zu der Art und Weise, auf welche wir personenbezogene Daten
                        erfassen, nutzen und offenlegen, wenn Sie unseren Dienst nutzen, sowie zu den Optionen, die
                        Ihnen im Zusammenhang mit diesen Daten zur Verfügung stehen. <a
                          href='https://www.freeprivacypolicy.com/blog/sample-privacy-policy-template/'>Vorlage für die
                          Datenschutzrichtlinie via FreePrivacyPolicy</a>.</p>

                      <p>Wir nutzen Ihre Daten zur Bereitstellung und Verbesserung unseres Dienstes. Durch
                        Inanspruchnahme des Dienstes erklären Sie sich mit der Erfassung und Nutzung von Daten durch uns
                        nach Maßgabe dieser Richtlinie einverstanden. Soweit in dieser Datenschutz-Richtlinie nicht
                        jeweils etwas anderes angegeben ist, kommt den in dieser Datenschutz-Richtlinie vorkommenden
                        Begriffen jeweils dieselbe Bedeutung zu, die diesen in unseren Allgemeinen Geschäftsbedingungen
                        (Terms and Conditions) (abrufbar über die https://chronas.org) zugewiesen wurde.</p>

                      <h3>Begriffsbestimmungen</h3>
                      <ul>
                        <li>
                          <p><strong>Dienst</strong></p>
                          <p>Der Dienst ist die von dem ChronasOrg betriebene Website https://chronas.org</p>
                        </li>
                        <li>
                          <p><strong>Personenbezogene Daten</strong></p>
                          <p>Personenbezogene Daten sind Daten, die sich auf eine lebende Person beziehen, welche anhand
                            dieser Daten (bzw. anhand dieser Daten in Kombination mit weiteren Informationen, die sich
                            bereits in unserem Besitz befinden oder mit Wahrscheinlichkeit in unseren Besitz gelangen
                            werden) identifizierbar ist.</p>
                        </li>
                        <li>
                          <p><strong>Nutzungsdaten</strong></p>
                          <p>Nutzungsdaten sind Daten, die automatisch im Rahmen der Nutzung des Dienstes oder innerhalb
                            der Dienstinfrastruktur selbst (beispielsweise für die Dauer eines Seitenbesuchs) erfasst
                            werden.</p>
                        </li>
                        <li>
                          <p><strong>Cookies</strong></p>
                          <p>Cookies sind kleine Dateien, die auf Ihrem Gerät (Computer oder mobiles Endgerät)
                            gespeichert werden.</p>
                        </li>
                      </ul>

                      <h3>Erfassung und Nutzung von Daten</h3>
                      <p>Wir erfassen verschiedene Arten von Daten für eine Reihe von Zwecken, um den Dienst, den wir
                        Ihnen zur Verfügung stellen, zu verbessern.</p>

                      <h3>Arten der erfassten Daten</h3>

                      <h4>Personenbezogene Daten</h4>
                      <p>Im Rahmen der Nutzung unseres Dienstes bitten wir Sie gegebenenfalls um die
                        Zurverfügungstellung bestimmter persönlich identifizierbarer Daten, die wir dazu nutzen, um Sie
                        zu kontaktieren oder zu identifizieren ("personenbezogene Daten"). Persönlich identifizierbare
                        Daten umfassen beispielsweise folgende Daten (sind jedoch nicht auf diese beschränkt):</p>

                      <ul>
                        <li>E-Mail-Adresse</li>
                        <li>Vorname und Nachname</li>
                        <li>Cookies und Nutzungsdaten</li>
                      </ul>

                      <h4>Nutzungsdaten</h4>

                      <p>Wir können außerdem Daten zu der Art und Weise erfassen, auf welche auf unseren Dienst
                        zugegriffen wird bzw. auf welche diese genutzt werden ("Nutzungsdaten"). Diese Nutzungsdaten
                        umfassen gegebenenfalls die Internet-Protocol-Adresse (IP-Adresse) Ihres Computers, Ihren
                        Browsertyp, Ihre Browserversion, die von Ihnen innerhalb unseres Dienstes besuchten Seiten, den
                        Zeitpunkt und das Datum Ihres Besuchs, die Gesamtverweildauer auf den betreffenden Seiten,
                        individuelle Geräteidentifikationsmerkmale und weitere Diagnostikdaten.</p>

                      <h4>Tracking & Cookies</h4>
                      <p>Wir setzen Cookies und ähnliche Tracking-Technologien zur Überwachung der Aktivität innerhalb
                        unseres Dienstes ein und speichern in diesem Zusammenhang bestimmte Daten.</p>
                      <p>Cookies sind Dateien mit einem geringen Datenumfang, wie zum Beispiel anonyme einzigartige
                        Identifikatoren. Cookies werden von einer Website an Ihren Browser gesendet und auf Ihrem Gerät
                        gespeichert. Die sonstigen von uns eingesetzten Tracking-Technologien sind so genannte Beacons,
                        Tags und Scripts und dienen der Erfassung und Nachverfolgung von Daten sowie der Verbesserung
                        und Analyse unseres Dienstes.</p>
                      <p>Sie können in den Einstellungen Ihres Browsers bestimmen, ob Sie alle Cookies ablehnen oder nur
                        bestimmte Cookies akzeptieren möchten. Falls Sie jedoch die Annahme von Cookies verweigern,
                        können Sie gegebenenfalls Teile unseres Dienstes nicht in Anspruch nehmen.</p>
                      <p>Beispiele für von uns eingesetzte Cookies:</p>
                      <ul>
                        <li><strong>Sitzungs-Cookies.</strong> Wir setzen Sitzungs-Cookies für den Betrieb unseres
                          Dienstes ein.
                        </li>
                        <li><strong>Präferenz-Cookies.</strong> Wir setzen Präferenz-Cookies ein, um Ihre Präferenzen
                          und verschiedenen Einstellungen zu speichern.
                        </li>
                        <li><strong>Sicherheits-Cookies.</strong> Wir setzen Sicherheits-Cookies für Sicherheitszwecke
                          ein.
                        </li>
                      </ul>

                      <h3>Datennutzung</h3>
                      <p>Wir bei ChronasOrg nutzen die erfassten Daten für verschiedene Zwecke, beispielsweise um:</p>
                      <ul>
                        <li>Ihnen unseren Dienst zur Verfügung zu stellen und diesen aufrecht zu erhalten;</li>
                        <li>Ihnen Änderungen in Bezug auf unseren Dienst mitzuteilen;</li>
                        <li>es Ihnen auf Wunsch zu ermöglichen, an den interaktiven Teilen unseres Dienstes
                          teilzunehmen;
                        </li>
                        <li>Kundendienstleistungen zur Verfügung zu stellen;</li>
                        <li>Analysedaten und sonstige wertvolle Daten zu erfassen, damit wir unseren Dienst verbessern
                          können;
                        </li>
                        <li>die Nutzung unseres Dienstes zu überwachen;</li>
                        <li>technische Probleme zu erkennen, zu vermeiden und zu beheben;</li>
                      </ul>

                      <h3>Übertragung von Daten</h3>
                      <p>Ihre Daten, einschließlich personenbezogener Daten, können auf Computer übertragen – und auf
                        solchen aufbewahrt – werden, die sich außerhalb Ihres Heimatstaates, Ihrer Heimatprovinz, Ihres
                        Heimatlandes oder einer sonstigen Rechtsordnung befinden und somit Datenschutzgesetzen
                        unterliegen, die sich von den Datenschutzgesetzen in Ihrer Rechtsordnung unterscheiden.</p>
                      <p>Falls Sie sich außerhalb von United States befinden und sich dazu entscheiden, Daten an uns zu
                        übermitteln, müssen Sie zur Kenntnis nehmen, dass wir Ihre Daten, einschließlich
                        personenbezogener Daten, nach United States übertragen und diese dort verarbeiten.</p>
                      <p>Ihre Zustimmung zu dieser Datenschutz-Richtlinie und eine nachfolgende Übermittlung von Daten
                        Ihrerseits stellt eine Einverständniserklärung Ihrerseits zu der genannten Übertragung dar.</p>
                      <p>ChronasOrg wird alle im zumutbaren Rahmen erforderlichen Schritte unternehmen um
                        sicherzustellen, dass Ihre Daten auf sichere Weise sowie in Übereinstimmung mit dieser
                        Datenschutz-Richtlinie behandelt werden, und dass Ihre personenbezogenen Daten nicht an
                        Organisationen oder in Länder übertragen werden, hinsichtlich welcher keine hinreichenden
                        Kontrollmechanismen in Bezug auf die Sicherheit Ihrer Daten und sonstigen personenbezogenen
                        Informationen vorliegen.</p>

                      <h3>Offenlegung von Daten</h3>

                      <h3>Gesetzliche Anforderungen</h3>
                      <p>ChronasOrg kann Ihre personenbezogenen Daten unter Umständen offenlegen, wenn es unter
                        Beachtung der Grundsätze von Treu und Glauben der Ansicht ist, dass dies zur Erreichung der
                        nachfolgenden Zielsetzungen erforderlich ist:</p>
                      <ul>
                        <li>zur Erfüllung einer gesetzlichen Pflicht</li>
                        <li>zum Schutz und zur Verteidigung der Rechte oder des Eigentums von ChronasOrg</li>
                        <li>zur Vermeidung oder Untersuchung möglicher Fehlverhaltensweisen in Bezug auf den Dienst</li>
                        <li>zum Schutz der persönlichen Sicherheit der Nutzer des Dienstes oder der Öffentlichkeit</li>
                        <li>zur Vermeidung von Haftungsansprüchen</li>
                      </ul>

                      <h3>Datensicherheit</h3>
                      <p>Die Sicherheit Ihrer Daten ist uns wichtig. Bitte vergessen Sie jedoch nicht, dass es keine
                        Übertragungsmethoden über das Internet und keine elektronischen Speichermedien gibt, die 100 %
                        sicher sind. Obwohl wir stets bemüht sind, kommerziell annehmbare Maßnahmen zum Schutz Ihrer
                        personenbezogenen Daten umzusetzen, können wir eine absolute Sicherheit nicht garantieren.</p>

                      <h3>Leistungsanbieter</h3>
                      <p>Wir beauftragen gegebenenfalls dritte Unternehmen und Einzelpersonen ("Leistungsanbieter") mit
                        Unterstützungsleistungen zum einfacheren Angebot unseres Dienstes, mit der Erbringung von
                        Leistungen in unserem Namen, mit der Erbringung von mit unserem Dienst verbundenen Leistungen
                        oder mit Unterstützungsleistungen zur Analyse der Art und Weise, auf die unser Dienst in
                        Anspruch genommen wird.</p>
                      <p>Diese Dritten können auf Ihre personenbezogenen Daten nur in dem Umfang Zugriff nehmen, der für
                        die Erfüllung der genannten Aufgaben in unserem Namen erforderlich ist, und dürfen diese für
                        keine sonstigen Zwecke offenlegen oder nutzen.</p>

                      <h3>Analytik</h3>
                      <p>Wir beauftragen gegebenenfalls dritte Leistungsanbieter mit der Überwachung und Analyse der
                        Nutzung unseres Dienstes.</p>
                      <ul>
                        <li>
                          <p><strong>Google Analytics</strong></p>
                          <p>Google Analytics ist ein von Google angebotener Web-Analytics-Dienst, der Zugriffe auf
                            Websites nachverfolgt und meldet. Google nutzt die gewonnenen Daten zur Nachverfolgung und
                            Überwachung der Nutzung unseres Dienstes. Diese Daten werden mit anderen Google-Diensten
                            geteilt. Google kann die gewonnenen Daten zur Kontextualisierung und Personalisierung der
                            Werbeanzeigen innerhalb seines eigenen Werbenetzwerks nutzen.</p>
                          <p>Sie können die Übertragung Ihrer Aktivität innerhalb unseres Dienstes an Google Analytics
                            abschalten, indem Sie das Browser-Add-on zur Deaktivierung von Google Analytics
                            installieren. Das Add-on verhindert eine Datenübertragung an Google Analytics zu Besuchen
                            bzw. Aktivität über das JavaScript von Google Analytics (ga.js, analytics.js und dc.js).</p>
                          <p>Weitere Informationen zu den Datenschutzmaßnahmen von Google können Sie auf Googles
                            Webseite zu seinen Datenschutzbestimmungen (Privacy Terms) einsehen: <a
                              href='https://policies.google.com/privacy?hl=en'>https://policies.google.com/privacy?hl=en</a>
                          </p>
                        </li>
                      </ul>

                      <h3>Links zu anderen Websites</h3>
                      <p>Unser Dienst kann Links zu anderen Websites enthalten, die nicht von uns betrieben werden. Wenn
                        Sie auf einen Drittlink klicken, werden Sie direkt auf die Website des betreffenden Dritten
                        weitergeleitet. Wir empfehlen Ihnen dringend, sich jeweils die Datenschutz-Richtlinien aller von
                        Ihnen besuchten Websites durchzulesen.</p>
                      <p>Wir haben keine Kontrolle über die Inhalte, Datenschutzvorschriften und -praktiken dritter
                        Websites oder Dienste und übernehmen in diesem Zusammenhang keine Haftung.</p>

                      <h3>Privatsphäre Minderjähriger</h3>
                      <p>Unser Dienst richtet sich nicht an Personen, die das 18. Lebensjahr noch nicht vollendet haben
                        ("minderjährige Personen").</p>
                      <p>Wir erfassen wissentlich keine persönlich identifizierbaren Daten zu minderjährigen Personen.
                        Falls Sie ein Elternteil oder Vormund sind und es Ihnen bekannt wird, dass eine Ihrer Aufsicht
                        unterstehende minderjährige Person uns personenbezogene Daten übermittelt hat, bitten wir Sie,
                        mit uns Kontakt aufzunehmen. Falls uns bekannt wird, dass wir personenbezogene Daten einer
                        minderjährigen Person ohne elterliche Zustimmung erfasst haben, setzen wir Maßnahmen zur
                        Entfernung dieser Daten von unseren Servern um.</p>

                      <h3>Änderungen dieser Datenschutz-Richtlinie</h3>
                      <p>Wir können unsere Datenschutz-Richtlinie von Zeit zu Zeit aktualisieren. Jegliche solcher
                        Änderungen teilen wir Ihnen mit, indem wir die aktualisierte Fassung auf dieser Seite
                        veröffentlichen.</p>
                      <p>Wir werden Sie vor dem Inkrafttreten der betreffenden Änderung per E-Mail und/oder mittels
                        einer sonstigen sichtbaren Mitteilung innerhalb unseres Dienstes informieren und das "Datum des
                        Inkrafttretens" am Beginn dieser Datenschutz-Richtlinie aktualisieren.</p>
                      <p>Wir empfehlen Ihnen, diese Datenschutz-Richtlinie regelmäßig auf Änderungen hin durchzusehen.
                        Änderungen dieser Datenschutz-Richtlinie werden im Zeitpunkt ihrer Veröffentlichung auf dieser
                        Seite wirksam.</p>

                      <h3>Kontaktaufnahme</h3>
                      <p>Falls Sie Fragen zu dieser Datenschutz-Richtlinie haben, können Sie wie folgt Kontakt zu uns
                        aufnehmen:</p>
                      <ul>
                        <li>Per E-Mail: dietmar.aumann@gmail.com</li>
                        <li>Durch Besuch der folgenden Seite unserer Website: https://chronas.org/#/info (Contact
                          section)
                        </li>

                      </ul>
                    </div>
                  </Tab>
                  <Tab label='Italian' value='italian' style={{ overflow: 'auto' }}>
                    <div role='tabpanel' className='tab-pane ' id='italian'>
                      <br />
                      <h3>Informativa sulla Privacy</h3>

                      <p>Data di entrata in vigore: December 12, 2018</p>

                      <p>ChronasOrg ("noi" o "nostro") gestisce il https://chronas.org sito web (in appresso il
                        "Servizio").</p>

                      <p>Questa pagina vi informa delle nostre politiche riguardanti la raccolta, l'uso e la
                        divulgazione dei dati personali quando usate il nostro Servizio e le scelte che avete associato
                        a quei dati. <a href='https://www.freeprivacypolicy.com/blog/sample-privacy-policy-template/'>Modello
                          di politica sulla privacy via FreePrivacyPolicy</a>.</p>

                      <p>Utilizziamo i vostri dati per fornire e migliorare il Servizio. Utilizzando il Servizio,
                        accettate la raccolta e l'utilizzo delle informazioni in conformità con questa informativa. Se
                        non diversamente definito nella presente Informativa sulla privacy, i termini utilizzati nella
                        presente Informativa hanno la stessa valenza dei nostri Termini e condizioni, accessibili da
                        https://chronas.org</p>

                      <h3>Definizioni</h3>
                      <ul>
                        <li>
                          <p><strong>Servizio</strong></p>
                          <p>Il Servizio è il sito https://chronas.org gestito da ChronasOrg</p>
                        </li>
                        <li>
                          <p><strong>Dati personali</strong></p>
                          <p>I Dati personali sono i dati di un individuo vivente che può essere identificato da quei
                            dati (o da quelli e altre informazioni in nostro possesso o che potrebbero venire in nostro
                            possesso).</p>
                        </li>
                        <li>
                          <p><strong>Dati di utilizzo</strong></p>
                          <p>I dati di utilizzo sono i dati raccolti automaticamente generati dall'utilizzo del Servizio
                            o dall'infrastruttura del Servizio stesso (ad esempio, la durata della visita di una
                            pagina).</p>
                        </li>
                        <li>
                          <p><strong>Cookies</strong></p>
                          <p>I cookie sono piccoli file memorizzati sul vostro dispositivo (computer o dispositivo
                            mobile).</p>
                        </li>
                      </ul>

                      <h3>Raccolta e uso delle informazioni</h3>
                      <p>Raccogliamo diversi tipi di informazioni per vari scopi, per fornire e migliorare il nostro
                        servizio.</p>

                      <h3>Tipologie di Dati raccolti</h3>

                      <h4>Dati personali</h4>
                      <p>Durante l'utilizzo del nostro Servizio, potremmo chiedervi di fornirci alcune informazioni di
                        identificazione personale che possono essere utilizzate per contattarvi o identificarvi ("Dati
                        personali"). Le informazioni di identificazione personale possono includere, ma non sono
                        limitate a:</p>

                      <ul>
                        <li>Indirizzo email</li>
                        <li>Nome e cognome</li>
                        <li>Cookie e dati di utilizzo</li>
                      </ul>

                      <h4>Dati di utilizzo</h4>

                      <p>Potremmo anche raccogliere informazioni su come l'utente accede e utilizza il Servizio ("Dati
                        di utilizzo"). Questi Dati di utilizzo possono includere informazioni quali l'indirizzo del
                        protocollo Internet del computer (ad es. Indirizzo IP), il tipo di browser, la versione del
                        browser, le pagine del nostro servizio che si visita, l'ora e la data della visita, il tempo
                        trascorso su tali pagine, identificatore unico del dispositivo e altri dati diagnostici.</p>

                      <h4>Tracciamento; dati dei cookie</h4>
                      <p>Utilizziamo cookie e tecnologie di tracciamento simili per tracciare l'attività sul nostro
                        Servizio e conservare determinate informazioni.</p>
                      <p>I cookie sono file con una piccola quantità di dati che possono includere un identificatore
                        univoco anonimo. I cookie vengono inviati al vostro browser da un sito web e memorizzati sul
                        vostro dispositivo. Altre tecnologie di tracciamento utilizzate sono anche beacon, tag e script
                        per raccogliere e tenere traccia delle informazioni e per migliorare e analizzare il nostro
                        Servizio.</p>
                      <p>Potete chiedere al vostro browser di rifiutare tutti i cookie o di indicare quando viene
                        inviato un cookie. Tuttavia, se non si accettano i cookie, potrebbe non essere possibile
                        utilizzare alcune parti del nostro Servizio.</p>
                      <p>Esempi di cookie che utilizziamo:</p>
                      <ul>
                        <li><strong>Cookie di sessione.</strong> Utilizziamo i cookie di sessione per gestire il nostro
                          servizio.
                        </li>
                        <li><strong>Cookie di preferenza.</strong> Utilizziamo i cookie di preferenza per ricordare le
                          vostre preferenze e varie impostazioni.
                        </li>
                        <li><strong>Cookie di sicurezza.</strong> Utilizziamo i cookie di sicurezza per motivi di
                          sicurezza.
                        </li>
                      </ul>

                      <h3>Uso dei dati</h3>
                      <p>ChronasOrg utilizza i dati raccolti per vari scopi:</p>
                      <ul>
                        <li>Per fornire e mantenere il nostro Servizio</li>
                        <li>Per comunicare agli utenti variazioni apportate al servizio che offriamo</li>
                        <li>Per permettere agli utenti di fruire, a propria discrezione, di funzioni interattive del
                          nostro servizio
                        </li>
                        <li>Per fornire un servizio ai clienti</li>
                        <li>Per raccogliere analisi o informazioni preziose in modo da poter migliorare il nostro
                          Servizio
                        </li>
                        <li>Per monitorare l'utilizzo del nostro Servizio</li>
                        <li>Per rilevare, prevenire e affrontare problemi tecnici</li>
                      </ul>

                      <h3>Trasferimento dei dati</h3>
                      <p>Le vostre informazioni, compresi i Dati personali, possono essere trasferite a - e mantenute su
                        - computer situati al di fuori del vostro stato, provincia, nazione o altra giurisdizione
                        governativa dove le leggi sulla protezione dei dati possono essere diverse da quelle della
                        vostra giurisdizione.</p>
                      <p>Se ci si trova al di fuori di United States e si sceglie di fornire informazioni a noi, si
                        ricorda che trasferiamo i dati, compresi i dati personali, in United States e li elaboriamo
                        lì.</p>
                      <p>Il vostro consenso alla presente Informativa sulla privacy seguito dall'invio di tali
                        informazioni rappresenta il vostro consenso al trasferimento.</p>
                      <p>ChronasOrg adotterà tutte le misure ragionevolmente necessarie per garantire che i vostri dati
                        siano trattati in modo sicuro e in conformità con la presente Informativa sulla privacy e nessun
                        trasferimento dei vostri Dati Personali sarà effettuato a un'organizzazione o a un paese a meno
                        che non vi siano controlli adeguati dei vostri dati e altre informazioni personali.</p>

                      <h3>Divulgazione di dati</h3>

                      <h3>Prescrizioni di legge</h3>
                      <p>ChronasOrg può divulgare i vostri Dati personali in buona fede, ritenendo che tale azione sia
                        necessaria per:</p>
                      <ul>
                        <li>Rispettare un obbligo legale</li>
                        <li>Proteggere e difendere i diritti o la proprietà di ChronasOrg</li>
                        <li>Prevenire o investigare possibili illeciti in relazione al Servizio</li>
                        <li>Proteggere la sicurezza personale degli utenti del Servizio o del pubblico</li>
                        <li>Proteggere contro la responsabilità legale</li>
                      </ul>

                      <h3>Sicurezza dei dati</h3>
                      <p>La sicurezza dei vostri dati è importante per noi, ma ricordate che nessun metodo di
                        trasmissione su Internet o metodo di archiviazione elettronica è sicuro al 100%. Pertanto, anche
                        se adotteremo ogni mezzo commercialmente accettabile per proteggere i vostri Dati personali, non
                        possiamo garantirne la sicurezza assoluta.</p>

                      <h3>Fornitori di servizi</h3>
                      <p>Potremmo impiegare società e individui di terze parti per facilitare il nostro Servizio
                        ("Fornitori di servizi"), per fornire il Servizio per nostro conto, per eseguire servizi
                        relativi ai Servizi o per aiutarci ad analizzare come viene utilizzato il nostro Servizio.</p>
                      <p>Le terze parti hanno accesso ai vostri Dati personali solo per eseguire queste attività per
                        nostro conto e sono obbligate a non rivelarle o utilizzarle per altri scopi.</p>

                      <h3>Statistiche</h3>
                      <p>Potremmo utilizzare i Fornitori di servizi di terze parti per monitorare e analizzare
                        l'utilizzo del nostro servizio.</p>
                      <ul>
                        <li>
                          <p><strong>Google Analytics</strong></p>
                          <p>Google Analytics è un servizio di analisi web offerto da Google che tiene traccia e segnala
                            il traffico del sito web. Google utilizza i dati raccolti per tracciare e monitorare
                            l'utilizzo del nostro Servizio. Questi dati sono condivisi con altri servizi di Google.
                            Google può utilizzare i dati raccolti per contestualizzare e personalizzare le inserzioni
                            della propria rete pubblicitaria.</p>
                          <p>Potete decidere di non rendere disponibile la vostra attività sul Servizio a Google
                            Analytics installando il componente aggiuntivo del browser per la disattivazione di Google
                            Analytics. Il componente aggiuntivo impedisce a JavaScript di Google Analytics (ga.js,
                            analytics.js e dc.js) di condividere informazioni con Google Analytics sull'attività delle
                            visite.</p>                                                                            <p>Per
                          ulteriori informazioni sulle prassi relative alla privacy di Google, vi preghiamo di visitare
                          la pagina web con i Termini della privacy di Google: <a
                            href='https://policies.google.com/privacy?hl=en'>https://policies.google.com/privacy?hl=en</a>
                            </p>
                        </li>
                      </ul>

                      <h3>Link ad altri siti</h3>
                      <p>OIl nostro servizio può contenere collegamenti ad altri siti non gestiti da noi. Cliccando su
                        un link di terze parti, sarete indirizzati al sito di quella terza parte. Ti consigliamo
                        vivamente di rivedere l'Informativa sulla privacy di ogni sito che visiti.</p>
                      <p>Non abbiamo alcun controllo e non ci assumiamo alcuna responsabilità per il contenuto, le
                        politiche sulla privacy o le pratiche di qualsiasi sito o servizio di terzi.</p>

                      <h3>Privacy dei minori</h3>
                      <p>Il nostro servizio non si rivolge a minori di 18 anni ("Bambini").</p>
                      <p>Non raccogliamo consapevolmente informazioni personali relative a utenti di età inferiore a 18
                        anni. Se siete un genitore o tutore e siete consapevoli che vostro figlio ci ha fornito Dati
                        personali, vi preghiamo di contattarci. Se veniamo a conoscenza del fatto che abbiamo raccolto
                        Dati personali da minori senza la verifica del consenso dei genitori, adotteremo provvedimenti
                        per rimuovere tali informazioni dai nostri server.</p>

                      <h3>Modifiche alla presente informativa sulla privacy</h3>
                      <p>Potremmo aggiornare periodicamente la nostra Informativa sulla privacy. Ti informeremo di
                        eventuali modifiche pubblicando la nuova Informativa sulla privacy in questa pagina.</p>
                      <p>Vi informeremo via e-mail e / o un avviso di rilievo sul nostro Servizio, prima che la modifica
                        diventi effettiva e aggiorneremo la "data di validità" nella parte superiore di questa
                        Informativa sulla privacy.</p>
                      <p>Si consiglia di rivedere periodicamente la presente Informativa sulla privacy per eventuali
                        modifiche. Le modifiche a tale informativa sulla privacy entrano in vigore nel momento in cui
                        vengono pubblicate su questa pagina.</p>

                      <h3>Contattaci</h3>
                      <p>In caso di domande sulla presente Informativa sulla privacy, si prega di contattarci:</p>
                      <ul>
                        <li>Tramite e-mail: dietmar.aumann@gmail.com</li>
                        <li>Visitando questa pagina sul nostro sito web: https://chronas.org/#/info (Contact section)
                        </li>

                      </ul>
                    </div>
                  </Tab>
                  <Tab label='Dutch' value='dutch' style={{ overflow: 'auto' }}>
                    <div role='tabpanel' className='tab-pane ' id='dutch'>
                      <br />
                      <h3>Privacybeleid</h3>

                      <p>Ingangsdatum: December 12, 2018</p>

                      <p>ChronasOrg ("ons", "wij" of "onze") beheert de https://chronas.org website ("hierna genoemd
                        Dienst").</p>

                      <p>Deze pagina bevat informatie over ons beleid met betrekking tot de verzameling, het gebruik en
                        de openbaarmaking van uw persoonsgegevens wanneer u onze Dienst gebruikt en de keuzes die u hebt
                        met betrekking tot die gegevens. <a
                          href='https://www.freeprivacypolicy.com/blog/sample-privacy-policy-template/'>Privacybeleid
                          sjabloon via FreePrivacyPolicy</a>.</p>

                      <p>Wij gebruiken uw gegevens om de Dienst te leveren en te verbeteren. Wanneer u de Dienst
                        gebruikt, gaat u akkoord met de verzameling en het gebruik van informatie in overeenstemming met
                        dit beleid. Tenzij anders bepaald in dit Privacybeleid heeft de terminologie die wordt gebruikt
                        in dit Privacybeleid dezelfde betekenis als in onze Algemene voorwaarden, beschikbaar op
                        https://chronas.org</p>

                      <h3>Definities</h3>
                      <ul>
                        <li>
                          <p><strong>Dienst</strong></p>
                          <p>Onder dienst verstaan wij de https://chronas.org website beheerd door ChronasOrg</p>
                        </li>
                        <li>
                          <p><strong>Gebruiksgegevens</strong></p>
                          <p>Onder gebruiksgegevens verstaan wij automatisch verzamelde gegevens die worden gegenereerd
                            door het gebruik van de Dienst of van de infrastructuur van de Dienst zelf (bijvoorbeeld, de
                            duur van het bezoek aan een pagina).</p>
                        </li>
                        <li>
                          <p><strong>Gebruiksgegevens</strong></p>
                          <p>Onder gebruiksgegevens verstaan wij automatisch verzamelde gegevens die worden gegenereerd
                            door het gebruik van de Dienst of van de infrastructuur van de Dienst zelf (bijvoorbeeld, de
                            duur van het bezoek aan een pagina).</p>
                        </li>
                        <li>
                          <p><strong>Cookies</strong></p>
                          <p>Cookies zijn informatiebestandjes die worden opgeslagen op uw apparaat (computer of mobiele
                            apparaat).</p>
                        </li>
                      </ul>

                      <h3>Gegevensverzameling en gebruik</h3>
                      <p>Wij verzamelen verschillende soorten gegevens voor uiteenlopende doeleinden om onze Dienst aan
                        u te kunnen leveren en om hem te verbeteren.</p>

                      <h3>Soorten gegevens die worden verzameld</h3>

                      <h4>Persoonsgegevens</h4>
                      <p>Wanneer u onze Dienst gebruikt, kunnen wij u vragen ons bepaalde persoonlijk identificeerbare
                        informatie te verstrekken die kan worden gebruikt om contact op te nemen met u of om u te
                        identificeren ("Persoonsgegevens"). Deze persoonlijk identificeerbare informatie kan omvatten
                        maar is niet beperkt tot:</p>

                      <ul>
                        <li>E-mailadres</li>
                        <li>Voor- en achternaam</li>
                        <li>Cookies en Gebruiksgegevens</li>
                      </ul>

                      <h4>Gebruiksgegevens</h4>

                      <p>Wij kunnen ook gegevens verzamelen over de wijze waarop de gebruiker toegang krijgt tot de
                        Dienst en hoe deze wordt gebruikt ("Gebruiksgegevens") Deze Gebruiksgegevens kunnen informatie
                        bevatten zoals het Internet Protocol adres (IP-adres) van uw computer, het type browser, de
                        versie van de browser, de pagina's die u hebt bezocht op onze Dienst, het tijdstip en de datum
                        van uw bezoek, de tijd die u hebt doorgebracht op die pagina's, unieke apparaat-ID's en andere
                        diagnostische gegevens.</p>

                      <h4>Tracking &amp; cookiegegevens</h4>
                      <p>Wij gebruiken cookies en soortgelijke volgtechnologieën om de activiteit op onze Dienst te
                        volgen en we bewaren bepaalde informatie.</p>
                      <p>Cookies zijn bestanden met een kleine hoeveelheid gegevens die een anonieme unieke ID kunnen
                        bevatten. Cookies worden van een website verzonden naar uw browser en opgeslagen op uw apparaat.
                        Er worden ook andere volgtechnologieën gebruikt zoals beacons, tags en scripts om gegevens te
                        verzamelen en te volgen en om onze Dienst te verbeteren en te analyseren.</p>
                      <p>U kunt uw browser instellen om alle cookies te weigeren of om aan te geven wanneer een cookie
                        wordt verzonden. Maar als u geen cookies aanvaardt, kunt u mogelijk niet alle functies van onze
                        Dienst gebruiken.</p>
                      <p>Voorbeelden van cookies die wij gebruiken:</p>
                      <ul>
                        <li><strong>Sessiecookies.</strong> Wij gebruiken Sessiecookies om onze Dienst te beheren.</li>
                        <li><strong>Voorkeurcookies.</strong> Wij gebruiken Voorkeurcookies om uw voorkeuren en
                          uiteenlopende instellingen bij te houden.
                        </li>
                        <li><strong>Veiligheidscookies.</strong> Wij gebruiken Veiligheidscookies voor
                          veiligheidsdoeleinden.
                        </li>
                      </ul>

                      <h3>Gebruik van gegevens</h3>
                      <p>ChronasOrg gebruikt de verzamelde gegevens voor uiteenlopende doeleinden:</p>
                      <ul>
                        <li>Om onze Dienst te leveren en te onderhouden</li>
                        <li>Om u wijzigingen in onze Dienst te melden</li>
                        <li>Om u de mogelijkheid te bieden om, indien gewenst, deel te nemen aan de interactieve
                          functies van onze Dienst
                        </li>
                        <li>Om onze klanten steun te verlenen</li>
                        <li>Om analyse- of waardevolle gegevens te verzamelen die we kunnen toepassen om onze Dienst te
                          verbeteren
                        </li>
                        <li>Om toezicht te houden op het gebruik van onze Dienst</li>
                        <li>Om technische problemen te detecteren, te voorkomen en te behandelen</li>
                        <li>Om u nieuws, speciale aanbiedingen en algemene informatie te bieden over onze goederen,
                          diensten en evenementen die gelijkaardig zijn aan wat u in het verleden al gekocht hebt of
                          waar u informatie over hebt gevraagd, tenzij u hebt aangegeven dat u dergelijke informatie
                          niet wenst te ontvangen.
                        </li>
                      </ul>

                      <h3>Overdracht van gegevens</h3>
                      <p>Uw gegevens, inclusief Persoonsgegevens, kunnen worden overgedragen naar — en bewaard op —
                        computers die zich buiten het rechtsgebied van uw provincie, land of een andere
                        overheidsinstantie bevinden waar de wetgeving inzake gegevensbescherming kan verschillen van de
                        wetgeving in uw rechtsgebied.</p>
                      <p>Let erop dat, als u zich buiten United States bevindt en u ons gegevens verstrekt, wij deze
                        gegevens, inclusief Persoonsgegevens, overdragen naar United States en ze daar verwerken.</p>
                      <p>Uw instemming met dit Privacybeleid gevolgd door uw indiening van dergelijke gegevens geven aan
                        dat u akkoord gaat met die overdracht.</p>
                      <p>ChronasOrg zal alle redelijkerwijs noodzakelijke stappen ondernemen om ervoor te zorgen dat uw
                        gegevens veilig en in overeenstemming met dit Privacybeleid worden behandeld en dat uw
                        Persoonsgegevens nooit worden overgedragen aan een organisatie of een land als er geen gepaste
                        controles zijn ingesteld, inclusief de veiligheid van uw gegevens en andere
                        persoonsgegevens.</p>

                      <h3>Openbaarmaking van gegevens</h3>

                      <h3>Wettelijke vereisten</h3>
                      <p>ChronasOrg kan uw Persoonsgegevens openbaar maken als het te goeder trouw de mening is
                        toegedaan dat een dergelijke handeling noodzakelijk is:</p>
                      <ul>
                        <li>Om te voldoen aan een wettelijke verplichting</li>
                        <li>Om de rechten en eigendom van ChronasOrg te beschermen en te verdedigen</li>
                        <li>Om mogelijke misstanden te voorkomen of te onderzoeken in verband met de Dienst</li>
                        <li>Om de persoonlijke veiligheid van gebruikers van de Dienst of het publiek te beschermen</li>
                        <li>Als bescherming tegen juridische aansprakelijkheid</li>
                      </ul>

                      <h3>Veiligheid van gegevens</h3>
                      <p>De veiligheid van uw gegevens is belangrijk voor ons, maar vergeet niet dat geen enkele methode
                        van verzending via het internet of elektronische methode van opslag 100% veilig is. Hoewel wij
                        ernaar streven commercieel aanvaardbare middelen toe te passen om uw Persoonsgegevens te
                        beschermen, kunnen wij de absolute veiligheid niet waarborgen.</p>

                      <h3>Dienstverleners</h3>
                      <p>Wij kunnen externe bedrijven en personen aanstellen om onze Dienst ("Dienstverleners") te
                        vereenvoudigen, om de Dienst te leveren in onze naam, om diensten uit te voeren in het kader van
                        onze Dienst of om ons te helpen bij de analyse van hoe onze Dienst wordt gebruikt.</p>
                      <p>Deze externe partijen hebben enkel toegang tot uw Persoonsgegevens om deze taken uit te voeren
                        in onze naam en zij mogen deze niet openbaar maken aan anderen of ze gebruiken voor andere
                        doeleinden.</p>

                      <h3>Analytics</h3>
                      <p>Wij kunnen beroep doen op externe Dienstverleners om het gebruik van onze Dienst te volgen en
                        te analyseren.</p>
                      <ul>
                        <li>
                          <p><strong>Google Analytics</strong></p>
                          <p>Google Analytics is een webanalyse-service van Google die het websiteverkeer volgt en
                            rapporteert. Google gebruikt de verzamelde gegevens om het gebruik van onze Dienst te volgen
                            en bij te houden. Deze gegevens worden gedeeld met andere Google diensten. Google kan de
                            verzamelde gegevens gebruiken om de advertenties van zijn eigen advertentienetwerk te
                            contextualiseren en te personaliseren.</p>
                          <p>U kunt aangeven dat u uw activiteit op de Dienst niet beschikbaar wenst te maken voor
                            Google Analytics door de Google Analytics opt-out browser add-on te installeren. Deze add-on
                            zorgt ervoor dat het Google Analytics JavaScript (ga.js, analytics.js en dc.js) geen
                            informatie kan delen met Google Analytics over uw activiteiten op het internet.</p><p>Voor
                          meer informatie over de privacypraktijken van Google verwijzen wij u naar de internetpagina
                          van Google Privacy en voorwaarden: <a
                            href='https://policies.google.com/privacy?hl=en'>https://policies.google.com/privacy?hl=en</a>
                            </p>
                        </li>
                      </ul>

                      <h3>Links naar andere sites</h3>
                      <p>Onze Dienst kan links bevatten naar andere sites die niet door ons worden beheerd. Als u klikt
                        op een link van een externe partij wordt u naar de site van die externe partij gebracht. Wij
                        raden u sterk aan het Privacybeleid te verifiëren van elke site die u bezoekt.</p>
                      <p>Wij hebben geen controle over en aanvaarden geen aansprakelijkheid met betrekking tot de
                        inhoud, het privacybeleid of de privacypraktijken van de sites of diensten van een externe
                        partij.</p>

                      <h3>Privacy van kinderen</h3>
                      <p>Onze dienst richt zich niet op personen die jonger zijn dan 18 ("Kinderen").</p>
                      <p>Wij verzamelen nooit bewust persoonlijk identificeerbare informatie van iemand die jonger is
                        dan 18 jaar oud. Als u een ouder of voogd bent en u stelt vast dat uw kind ons persoonsgegevens
                        heeft geleverd, vragen wij u contact op te nemen met ons. Als u vaststelt dat wij
                        persoonsgegevens hebben verzameld van kinderen zonder de verificatie van ouderlijk toezicht
                        zullen wij de nodige stappen ondernemen om die informatie te verwijderen van onze servers.</p>

                      <h3>Wijzigingen aan dit Privacybeleid</h3>
                      <p>Wij kunnen ons Privacybeleid op gezette tijden bijwerken. Wij zullen u op de hoogte brengen van
                        eventuele wijzigingen door het nieuwe Privacybeleid te publiceren op deze pagina.</p>
                      <p>Wij zullen u op de hoogte brengen via e-mail en/of een duidelijke melding op onze Dienst voor
                        de wijzigingen van kracht gaan en wij zullen de "aanvangsdatum" bijwerken die vermeld staat
                        bovenaan in dit Privacybeleid.</p>
                      <p>Wij raden u aan dit Privacybeleid regelmatig te controleren op eventuele wijzigingen.
                        Wijzigingen aan dit Privacybeleid gaan van kracht op het moment dat ze worden gepubliceerd op
                        deze pagina.</p>

                      <h3>Contact opnemen</h3>
                      <p>Als u vragen hebt over dit Privacybeleid kunt u contact opnemen met ons:</p>
                      <ul>
                        <li>Via email: dietmar.aumann@gmail.com</li>
                        <li>Via deze pagina op onze website: https://chronas.org/#/info (Contact section)</li>

                      </ul>
                    </div>
                  </Tab>
                </Tabs>
              </Tab>
            </Tabs>
          </div>
        </Card>
      </Dialog>
    )
  }
}

export default translate(TOS)
