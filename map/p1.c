#include <stdio.h>
#define PI 3.1416
double factorial(double x);
double ConversionGradRad(double x);
double *pedirDatos(double *x);
double evaluar(double *val);

int main()
{
	double a[2],*p;
	p = pedirDatos(a);
	evaluar(p);

	return 0;
}

double *pedirDatos(double *array){
	printf("Introduce el angulo\n");
	scanf("%lf", (array));
	printf("Introduce el N\n");
	scanf("%lf",(array+1));
	return array;
}



double evaluar(double *val){//obtiene los valores del arreglo
	//array provisional
	printf("hola");
	double array[(int)*(val)];
	double angulo = ConversionGradRad(*(val));

	printf("%lf\n",angulo);

}


double factorial(double x){
	double var=1;
	for (int i = 1; i < x; ++i)
		var *= i;
	return var;
}
double ConversionGradRad(double x){
	return (2*PI*x)/360;
}


