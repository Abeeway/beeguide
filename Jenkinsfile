pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  serviceAccountName: jenkins
                  containers:
                    - name: jnlp
                      image: jenkins/inbound-agent:latest-jdk17
                    - name: docker
                      image: docker:27-cli
                      command: ["sleep"]
                      args: ["infinity"]
                      env:
                        - name: DOCKER_HOST
                          value: tcp://localhost:2375
                    - name: dind
                      image: docker:27-dind
                      securityContext:
                        privileged: true
                      env:
                        - name: DOCKER_TLS_CERTDIR
                          value: ""
                      args:
                        - --host=tcp://0.0.0.0:2375
                        - --host=unix:///var/run/docker.sock
                    - name: kubectl
                      image: alpine/kubectl:1.35.4
                      command: ["sleep"]
                      args: ["infinity"]
            '''
        }
    }

    environment {
        REGISTRY      = 'rg.fr-par.scw.cloud/namespace-abeeway'
        IMAGE_NAME    = 'abeeway-guide-docs'
        IMAGE_TAG     = "${env.GIT_COMMIT.take(8)}"
        FULL_IMAGE    = "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        K8S_NAMESPACE = 'docs'
        K8S_DEPLOY    = 'abeeway-guide-docs'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Diagnose') {
            steps {
                container('docker') {
                    sh '''
                        echo "=== Network ports listening ==="
                        netstat -tln 2>/dev/null || ss -tln 2>/dev/null || echo "no netstat/ss"
                        echo "=== Trying to reach dind ==="
                        nc -zv localhost 2375 2>&1 || echo "nc not available"
                        wget -qO- http://localhost:2375/_ping 2>&1 || echo "wget failed"
                        echo "=== DOCKER_HOST env ==="
                        echo "DOCKER_HOST=$DOCKER_HOST"
                    '''
                }
            }
        }
        
        stage('Build image') {
            steps {
                container('docker') {
                    sh 'docker build -t ${FULL_IMAGE} -t ${REGISTRY}/${IMAGE_NAME}:latest .'
                }
            }
        }

        stage('Push to Scaleway Registry') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(
                        credentialsId: 'scaleway-registry',
                        usernameVariable: 'REG_USER',
                        passwordVariable: 'REG_PASS'
                    )]) {
                        sh '''
                            echo "$REG_PASS" | docker login rg.fr-par.scw.cloud -u "$REG_USER" --password-stdin
                            docker push ${FULL_IMAGE}
                            docker push ${REGISTRY}/${IMAGE_NAME}:latest
                            docker logout rg.fr-par.scw.cloud
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kapsule') {
            steps {
                container('kubectl') {
                    withCredentials([file(credentialsId: 'scaleway-kubeconfig', variable: 'KUBECONFIG')]) {
                        sh '''
                            kubectl --kubeconfig="$KUBECONFIG" -n ${K8S_NAMESPACE} \
                                set image deployment/${K8S_DEPLOY} \
                                ${K8S_DEPLOY}=${FULL_IMAGE} --record
                            kubectl --kubeconfig="$KUBECONFIG" -n ${K8S_NAMESPACE} \
                                rollout status deployment/${K8S_DEPLOY} --timeout=5m
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Successfully deployed ${FULL_IMAGE} to ${K8S_NAMESPACE}/${K8S_DEPLOY}"
        }
        failure {
            echo "Build failed for ${env.BRANCH_NAME ?: 'unknown branch'} @ ${env.GIT_COMMIT}"
        }
    }
}